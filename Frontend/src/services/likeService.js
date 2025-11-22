// Like Service - Kết nối với Backend API
import apiService from "./api";

export const likeService = {
  // Lấy số lượng likes của một target (post hoặc comment)
  async getLikeCount(targetType, targetId) {
    try {
      return await apiService.get(`/likes/target/${targetType}/${targetId}/count`);
    } catch (error) {
      console.error("Error fetching like count:", error);
      return 0;
    }
  },

  // Kiểm tra user đã like chưa
  async checkUserLike(userId, targetType, targetId) {
    try {
      return await apiService.get(`/likes/user/${userId}/target/${targetType}/${targetId}`);
    } catch (error) {
      console.error("Error checking user like:", error);
      return false;
    }
  },

  // Lấy danh sách likes của một target
  async getLikesByTarget(targetType, targetId) {
    try {
      return await apiService.get(`/likes/target/${targetType}/${targetId}`);
    } catch (error) {
      console.error("Error fetching likes by target:", error);
      throw error;
    }
  },

  // Tạo like mới
  async createLike(likeData) {
    try {
      return await apiService.post("/likes", likeData);
    } catch (error) {
      console.error("Error creating like:", error);
      throw error;
    }
  },

  // Xóa like (unlike)
  async deleteLike(likeId) {
    try {
      return await apiService.delete(`/likes/${likeId}`);
    } catch (error) {
      console.error("Error deleting like:", error);
      throw error;
    }
  },

  // Like/Unlike một target (post hoặc comment)
  async toggleLike(userId, targetType, targetId) {
    try {
      // Check if user already liked
      const hasLiked = await this.checkUserLike(userId, targetType, targetId);
      
      if (hasLiked) {
        // Get the like ID and delete it
        const likes = await this.getLikesByTarget(targetType, targetId);
        const userLike = likes.find(like => like.userId === userId);
        if (userLike) {
          return await this.deleteLike(userLike.id);
        }
      } else {
        // Create new like
        return await this.createLike({
          userId,
          targetType,
          targetId
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  },
};

export default likeService;

