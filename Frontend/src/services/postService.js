// Post Service sử dụng Mock API
import mockApi from "./mockApi";

export const postService = {
  // Lấy danh sách tất cả bài viết
  async getPosts() {
    try {
      return await mockApi.getPosts();
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  },

  // Lấy chi tiết bài viết theo ID
  async getPostById(id) {
    try {
      return await mockApi.getPostById(id);
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error;
    }
  },

  // Tạo bài viết mới
  async createPost(postData) {
    try {
      return await mockApi.createPost(postData);
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  },

  // Lấy bài viết theo tác giả
  async getPostsByAuthor(authorId) {
    try {
      const posts = await this.getPosts();
      return posts.filter((post) => post.author === authorId);
    } catch (error) {
      console.error("Error fetching posts by author:", error);
      throw error;
    }
  },

  // Tìm kiếm bài viết
  async searchPosts(query) {
    try {
      const posts = await this.getPosts();
      const searchTerm = query.toLowerCase();

      return posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error("Error searching posts:", error);
      throw error;
    }
  },
};

export default postService;
