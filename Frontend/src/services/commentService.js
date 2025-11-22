// Comment Service - Kết nối với Backend API
import apiService from "./api";

export const commentService = {
  // Lấy danh sách comments theo post
  async getCommentsByPost(postId) {
    try {
      return await apiService.get(`/comments/post/${postId}`);
    } catch (error) {
      console.error("Error fetching comments by post:", error);
      throw error;
    }
  },

  // Lấy chi tiết comment theo ID
  async getCommentById(id) {
    try {
      return await apiService.get(`/comments/${id}`);
    } catch (error) {
      console.error("Error fetching comment:", error);
      throw error;
    }
  },

  // Tạo comment mới
  async createComment(commentData) {
    try {
      return await apiService.post("/comments", commentData);
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  },

  // Cập nhật comment
  async updateComment(id, commentData) {
    try {
      return await apiService.put(`/comments/${id}`, commentData);
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  },

  // Xóa comment
  async deleteComment(id) {
    try {
      return await apiService.delete(`/comments/${id}`);
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  // Lấy comments theo tác giả
  async getCommentsByAuthor(authorId) {
    try {
      return await apiService.get(`/comments/author/${authorId}`);
    } catch (error) {
      console.error("Error fetching comments by author:", error);
      throw error;
    }
  },
};

export default commentService;

