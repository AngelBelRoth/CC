const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const User = require("../models/User");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "asc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      res.render("post.ejs", { post: post, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  search: async (req, res) => {
    try {
      let searchBusiness = req.body.businessType

      if (searchBusiness === 'all') {
        const posts = await Post.find().sort({ createdAt: "desc" }).lean();
        res.render("feed.ejs", { posts: posts })
      } else {
        let filter = {
          businessType: searchBusiness
        }
        const posts = await Post.find(filter).sort({ createdAt: "desc" }).lean();
        res.render("feed.ejs", { posts: posts });
      }
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      console.log(req.body)
      await Post.create({
        image: result.secure_url,
        cloudinaryId: result.public_id,
        company: req.body.company,
        brand: req.body.brand,
        location: req.body.location,
        businessType: req.body.businessType,
        ps: req.body.ps,
        about: req.body.about,
        looking: req.body.looking,
        contact: req.body.contact,
        likes: 0,
        user: req.user.id

      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  updatePost: async (req, res) => {
    try {
      // Find post by id
      let oldPost = await Post.findById({ _id: req.params.id });
      let result = {
        "secure_url": oldPost.image,
        "public_id": oldPost.cloudinaryId
      }
      if (req.file) {
        // Update image to cloudinary
        result = await cloudinary.uploader.upload(req.file.path);
        // Check if the id is existed, Delete image from cloudinary
        if (oldPost.cloudinaryId) {
          await cloudinary.uploader.destroy(oldPost.cloudinaryId);
        }
      }

      const post = await Post.findByIdAndUpdate(
        { _id: req.params.id },
        {
          image: result.secure_url,
          cloudinaryId: result.public_id,
          brand: req.body.brand,
          company: req.body.company,
          location: req.body.location,
          businessType: req.body.businessType,
          ps: req.body.ps,
          about: req.body.about,
          looking: req.body.looking,
          contact: req.body.contact
        },
      );
      console.log("Post has been updated!");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
      res.redirect("/profile");
    }
  },
  likePost: async (req, res) => {
    // try {
    //   await Post.findOneAndUpdate(
    //     { _id: req.params.id },
    //     {
    //       $inc: { likes: 1 },
    //     }
    //   );
    //   console.log("Likes +1");
    //   res.redirect(`/post/${req.params.id}`);
    // } catch (err) {
    //   console.log(err);
    // }

    try {

      const post = await Post.findById(req.params.id);
      const userId = req.user._id;

      // Already liked?
      const alreadyLiked = post.likedBy.includes(userId);

      if (!alreadyLiked) {
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $addToSet: { likedBy: userId } // prevents duplicates
          }
        )

        console.log("User liked the post");
      } else {
         await Post.findOneAndUpdate(
          { _id: req.params.id },
          {
            $inc: { likes: -1 },
            $pull: { likedBy: userId }
          }
        ); 
        console.log("User already liked this post");
      }
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.error(err);
      res.redirect("/");
    }
  },


  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },

 // favoritePost: async (req, res) => {
  //   // if (req.user.favorite.includes(req.params.id)) {
  //   //   req.user.favorite = req.user.favorite.filter(v => v !== req.params.id)
  //   // } else {
  //   //   req.user.favorite.push(req.params.id)
  //   // }
  //   // res.redirect(`/post/${req.params.id}`);
  //   // console.log('favoritePost')
  // },


  toggleFavorite: async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.user._id;

      // Verify post exists
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if already favorited
      const isFavorited = req.user.favorites.includes(postId);

      if (isFavorited) {
        // Remove from favorites
        await User.findByIdAndUpdate(
          userId,
          { $pull: { favorites: postId } },
          { new: true }
        );
      } else {
        // Add to favorites (prevents duplicates via $addToSet)
        await User.findByIdAndUpdate(
          userId,
          { $addToSet: { favorites: postId } },
          { new: true }
        );
      }
      res.redirect(`/post/${req.params.id}`);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Failed to update favorite' });

    } 
  },

  // Get user's favorites
  getFavorites: async (req, res) => {
    console.log('hello')
    try {
      const user = await User.findById(req.user._id).populate('favorites');
       res.render("feed.ejs", { posts: user.favorites })
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  },

  // Check if post is favorited by user
  isFavorited: async (req, res) => {
    try {
      const isFavorited = req.user.favorites.includes(req.params.id);
      res.json({ isFavorited });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check favorite' });
    }
  },



  // Add review
  addReview: async (req, res) => {
    try {
      const postId = req.params.id;
      const { rating, comment } = req.body;

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      if (!comment || comment.trim() === '') {
        return res.status(400).json({ error: 'Comment is required' });
      }

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if user already reviewed
      const existingReview = post.reviews.find(
        review => review.user.toString() === req.user._id.toString()
      );

      if (existingReview) {
        return res.status(400).json({ error: 'You have already reviewed this company' });
      }

      // Add review
      post.reviews.push({
        user: req.user._id,
        userName: req.user.userName,
        rating: parseInt(rating),
        comment: comment.trim()
      });

      // Calculate average rating
      const totalRating = post.reviews.reduce((sum, review) => sum + review.rating, 0);
      post.averageRating = (totalRating / post.reviews.length).toFixed(1);
      post.totalReviews = post.reviews.length;

      await post.save();

      res.redirect(`/post/${postId}`);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to add review' });
    }
  },

  // Delete review
  deleteReview: async (req, res) => {
    try {
      const { postId, reviewId } = req.params;

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const review = post.reviews.id(reviewId);
      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      // Check if user owns the review
      if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Remove review
      post.reviews.pull(reviewId);

      // Recalculate average rating
      if (post.reviews.length > 0) {
        const totalRating = post.reviews.reduce((sum, review) => sum + review.rating, 0);
        post.averageRating = (totalRating / post.reviews.length).toFixed(1);
      } else {
        post.averageRating = 0;
      }
      post.totalReviews = post.reviews.length;

      await post.save();

      res.redirect(`/post/${postId}`);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to delete review' });
    }
  }
  
};
