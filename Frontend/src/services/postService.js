// services/postService.js
import apiService from "./api";

export const postService = {
  // Lấy bài viết theo channel
  async getPostsByChannel(channelId) {
    try {
      return await apiService.get(`/posts/channel/${channelId}`);
    } catch (error) {
      console.error("Error fetching posts by channel:", error);
      throw error;
    }
  },

  // Lấy chi tiết bài viết theo ID
  async getPostById(id) {
    try {
      return await apiService.get(`/posts/${id}`);
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error;
    }
  },

  // Tạo bài viết mới
  async createPost(postData) {
    try {
      return await apiService.post("/posts", postData);
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  // Cập nhật bài viết
  async updatePost(id, postData) {
    try {
      return await apiService.put(`/posts/${id}`, postData);
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  },

  // Xóa bài viết
  async deletePost(id) {
    try {
      return await apiService.delete(`/posts/${id}`);
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  },

  // Lấy bài viết theo tác giả
  async getPostsByAuthor(authorId) {
    try {
      return await apiService.get(`/posts/author/${authorId}`);
    } catch (error) {
      console.error("Error fetching posts by author:", error);
      throw error;
    }
  },

  // Like bài viết
  async likePost(postId) {
    try {
      return await apiService.post(`/posts/${postId}/like`);
    } catch (error) {
      console.error("Error liking post:", error);
      throw error;
    }
  },

  // Unlike bài viết
  async unlikePost(postId) {
    try {
      return await apiService.delete(`/posts/${postId}/like`);
    } catch (error) {
      console.error("Error unliking post:", error);
      throw error;
    }
  },

  // Lấy comments của bài viết
  async getComments(postId) {
    try {
      return await apiService.get(`/posts/${postId}/comments`);
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  // Tạo comment
  async createComment(postId, commentData) {
    try {
      return await apiService.post(`/posts/${postId}/comments`, commentData);
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  },

  // Xóa comment
  async deleteComment(postId, commentId) {
    try {
      return await apiService.delete(`/posts/${postId}/comments/${commentId}`);
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  async getHotPosts() {
    return await apiService.get("/posts/hot");
  },

  async getAllPostsForAdmin(page = 0, size = 10, search = "", eventId = "all") {
    const queryString = `?page=${page}&size=${size}&search=${encodeURIComponent(search)}&eventId=${eventId}`;
    return await apiService.get(`/posts/admin/all${queryString}`);
  },

  async searchPosts(page = 0, size = 10, search = "", eventId = "all") {
    const queryString = `?page=${page}&size=${size}&search=${encodeURIComponent(search)}&eventId=${eventId}`;
    return await apiService.get(`/posts/search${queryString}`);
  },
};

export default postService;