package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.Post;
import com.volunteerhub.VolunteerHub.dto.request.Post.PostCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Post.PostUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.PostResponse;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-10T20:20:36+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Microsoft)"
)
@Component
public class PostMapperImpl implements PostMapper {

    @Override
    public Post toPost(PostCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        Post.PostBuilder post = Post.builder();

        post.channelId( request.getChannelId() );
        post.authorId( request.getAuthorId() );
        post.content( request.getContent() );
        List<String> list = request.getImages();
        if ( list != null ) {
            post.images( new ArrayList<String>( list ) );
        }

        return post.build();
    }

    @Override
    public void updatePost(Post post, PostUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        post.setContent( request.getContent() );
        if ( post.getImages() != null ) {
            List<String> list = request.getImages();
            if ( list != null ) {
                post.getImages().clear();
                post.getImages().addAll( list );
            }
            else {
                post.setImages( null );
            }
        }
        else {
            List<String> list = request.getImages();
            if ( list != null ) {
                post.setImages( new ArrayList<String>( list ) );
            }
        }
        post.setLikesCount( request.getLikesCount() );
        post.setCommentsCount( request.getCommentsCount() );
    }

    @Override
    public PostResponse toPostResponse(Post post) {
        if ( post == null ) {
            return null;
        }

        PostResponse.PostResponseBuilder postResponse = PostResponse.builder();

        postResponse.id( post.getId() );
        postResponse.channelId( post.getChannelId() );
        postResponse.authorId( post.getAuthorId() );
        postResponse.authorName( post.getAuthorName() );
        postResponse.authorAvatar( post.getAuthorAvatar() );
        postResponse.title( post.getTitle() );
        postResponse.category( post.getCategory() );
        List<String> list = post.getTags();
        if ( list != null ) {
            postResponse.tags( new ArrayList<String>( list ) );
        }
        postResponse.content( post.getContent() );
        List<String> list1 = post.getImages();
        if ( list1 != null ) {
            postResponse.images( new ArrayList<String>( list1 ) );
        }
        postResponse.likesCount( post.getLikesCount() );
        postResponse.commentsCount( post.getCommentsCount() );
        postResponse.views( post.getViews() );
        postResponse.createdAt( post.getCreatedAt() );
        postResponse.updatedAt( post.getUpdatedAt() );

        return postResponse.build();
    }
}
