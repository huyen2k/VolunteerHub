package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Channel;
import com.volunteerhub.VolunteerHub.collection.Post;
import com.volunteerhub.VolunteerHub.dto.request.Post.PostCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Post.PostUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.PostResponse;
import com.volunteerhub.VolunteerHub.dto.response.UserResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.PostMapper;
import com.volunteerhub.VolunteerHub.repository.ChannelRepository;
import com.volunteerhub.VolunteerHub.repository.CommentRepository;
import com.volunteerhub.VolunteerHub.repository.LikeRepository;
import com.volunteerhub.VolunteerHub.repository.PostRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import java.util.Objects;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PostService {

    PostRepository postRepository;
    PostMapper postMapper;
    LikeRepository likeRepository;
    CommentRepository commentRepository;
    ChannelRepository channelRepository;
    UserService userService;
    MongoTemplate mongoTemplate;
    EventRepository eventRepository;

    /**
     * Lấy bài viết của channel có phân trang.
     */
    public Page<PostResponse> getPostsByChannelId(String channelId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String currentUserId = getSafeCurrentUserId();
        Page<Post> postsPage = postRepository.findByChannelId(channelId, pageable);
        return postsPage.map(post -> enrichPostResponse(post, currentUserId));
    }

    /**
     * Lấy bài viết của tác giả
     */
    public List<PostResponse> getPostsByAuthorId(String authorId) {
        String currentUserId = getSafeCurrentUserId();
        return postRepository.findByAuthorId(authorId).stream()
                .map(post -> enrichPostResponse(post, currentUserId))
                .collect(Collectors.toList());
    }

    /**
     * Lấy bài viết nổi bật (Top 5)
     */
    public List<PostResponse> getHotPosts() {
        Pageable limit = PageRequest.of(0, 5);
        String currentUserId = getSafeCurrentUserId();
        // Fallback: Dùng findAll có limit nếu chưa có hàm custom query
        return postRepository.findAll(limit).stream()
                .map(post -> enrichPostResponse(post, currentUserId))
                .collect(Collectors.toList());
    }

    public PostResponse getPost(String postId){
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        return enrichPostResponse(post, getSafeCurrentUserId());
    }

    public Post getPostEntity(String postId){
        return postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
    }

    public long getPostCountByChannelId(String channelId) {
        return postRepository.countByChannelId(channelId);
    }

    public PostResponse createPost(PostCreationRequest request){
        Post post = postMapper.toPost(request);
        post.setLikesCount(0L);
        post.setCommentsCount(0L);
        if(post.getImages() == null) post.setImages(List.of());

        // Denormalize: Lưu luôn tên/avatar tác giả
        try {
            var author = userService.getUserById(post.getAuthorId());
            post.setAuthorName(author.getFull_name());
            post.setAuthorAvatar(author.getAvatar_url());
        } catch (Exception ignored) {}

        postRepository.save(post);
        return enrichPostResponse(post, getSafeCurrentUserId());
    }

    public PostResponse updatePost(String postId, PostUpdateRequest request){
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));

        postMapper.updatePost(post, request);

        // Cập nhật lại thông tin tác giả nếu cần
        try {
            if (post.getAuthorId() != null) {
                var author = userService.getUserById(post.getAuthorId());
                post.setAuthorName(author.getFull_name());
                post.setAuthorAvatar(author.getAvatar_url());
            }
        } catch (Exception ignored) {}

        postRepository.save(post);
        return enrichPostResponse(post, getSafeCurrentUserId());
    }

    public void deletePost(String postId) {
        // 1. Tìm bài viết
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));

        // 2. Lấy thông tin user hiện tại
        UserResponse currentUser = userService.getMyInfo();

        // Lấy danh sách roles (tránh null pointer nếu user chưa có role nào)
        Set<String> userRoles = currentUser.getRoles();
        if (userRoles == null) userRoles = Set.of();

        boolean isAuthorized = false;

        // --- CASE A: Admin ---
        // Kiểm tra xem trong list roles có chứa chuỗi "ADMIN" không
        if (userRoles.contains("ADMIN")) {
            isAuthorized = true;
        }

        // --- CASE B: Chính chủ (Tác giả bài viết) ---
        else if (Objects.equals(post.getAuthorId(), currentUser.getId())) {
            isAuthorized = true;
        }

        // --- CASE C: Manager ---
        // Kiểm tra xem trong list roles có chứa "MANAGER" không
        else if (userRoles.contains("MANAGER")) {
            if (post.getChannelId() != null) {
                Channel channel = channelRepository.findById(post.getChannelId())
                        .orElse(null);

                if (channel != null) {
                    var event = eventRepository.findById(channel.getEventId()).orElse(null);
                    // Nếu user hiện tại là người tạo ra Event này
                    if (event != null && Objects.equals(event.getCreatedBy(), currentUser.getId())) {
                        isAuthorized = true;
                    }
                }
            }
        }

        // 4. Chặn nếu không có quyền
        if (!isAuthorized) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // 5. Xóa
        postRepository.deleteById(postId);
    }

    /**
     * HÀM TÌM KIẾM CHUNG (DÙNG CHO CẢ USER, MANAGER, ADMIN)
     * Thay thế cho getAllPostsForAdmin cũ
     */
    public Page<PostResponse> searchPosts(String search, String eventId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Query query = new Query();

        // 1. Tìm kiếm (Search)
        if (search != null && !search.trim().isEmpty()) {
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("content").regex(search, "i"),
                    Criteria.where("authorName").regex(search, "i")
            );
            query.addCriteria(searchCriteria);
        }

        // 2. Lọc theo Event (Filter)
        if (eventId != null && !eventId.equals("all")) {
            if (eventId.equals("global")) {
                query.addCriteria(Criteria.where("isGlobal").is(true));
            } else {
                Channel channel = channelRepository.findByEventId(eventId).orElse(null);
                if (channel != null) {
                    query.addCriteria(Criteria.where("channelId").is(channel.getId()));
                } else {
                    query.addCriteria(Criteria.where("_id").is("non-existent-id"));
                }
            }
        }

        long total = mongoTemplate.count(query, Post.class);
        query.with(pageable);
        List<Post> posts = mongoTemplate.find(query, Post.class);

        return new PageImpl<>(posts, pageable, total)
                .map(post -> enrichPostResponse(post, null));
    }

    // ========================================================================
    // PRIVATE HELPERS
    // ========================================================================

    private String getSafeCurrentUserId() {
        try {
            UserResponse myInfo = userService.getMyInfo();
            return myInfo != null ? myInfo.getId() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private PostResponse enrichPostResponse(Post post, String currentUserId) {
        PostResponse res = postMapper.toPostResponse(post);

        // 1. Fallback thông tin tác giả
        if (res.getAuthorName() == null && post.getAuthorId() != null) {
            try {
                var a = userService.getUserById(post.getAuthorId());
                res.setAuthorName(a.getFull_name());
                res.setAuthorAvatar(a.getAvatar_url());
            } catch (Exception ignored) {}
        }

        // 2. Map Like/Comment/IsLiked
        try {
            res.setLikesCount(likeRepository.countByTargetTypeAndTargetId("post", post.getId()));
            res.setCommentsCount(commentRepository.countByPostId(post.getId()));

            if (currentUserId != null) {
                res.setIsLiked(likeRepository.existsByUserIdAndTargetTypeAndTargetId(currentUserId, "post", post.getId()));
            } else {
                res.setIsLiked(false);
            }
        } catch (Exception ignored) {
            res.setLikesCount(0L);
            res.setCommentsCount(0L);
            res.setIsLiked(false);
        }

        // 3. Map EventId từ Channel
        try {
            if (post.getChannelId() != null) {
                channelRepository.findById(post.getChannelId()).ifPresent(channel -> {
                    res.setEventId(channel.getEventId());


                    if (channel.getEventId() != null) {
                        eventRepository.findById(channel.getEventId()).ifPresent(event -> {
                            res.setTitle(event.getTitle());
                        });
                    }
                });
            }
        } catch (Exception ignored) {}

        return res;
    }
}