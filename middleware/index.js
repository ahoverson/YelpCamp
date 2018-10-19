var Campground = require('../models/campground');
var Comment = require('../models/comment');
var Review = require('../models/review');

// all middleware lives here
var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be signed in to do that!"); // key, value
    res.redirect("/login");
};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground does not exist.")
            res.redirect("/campgrounds");
        } else if(foundCampground.author.id.equals(req.user._id)) {
            //console.log(foundCampground.author.id); this is a Mongoose object
            //console.log(req.user._id): this is a string, not comparable with ===
            req.campground = foundCampground;
            next();
        } else {
            req.flash("error", "You don't have permission to do that.")
            res.redirect("back");
        }
    });
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err || !foundComment){
            req.flash('error', "That comment does not exist.");
            res.redirect("/campgrounds");
        } else if(foundComment.author.id.equals(req.user._id)){
            req.comment = foundComment;
            next();
        } else {
            req.flash("error", "You don't have permission to do that!")
            res.redirect("back");
        }
    });
};

middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id).populate("reviews").exec(function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.reviews
                var foundUserReview = foundCampground.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("back");
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

middlewareObj.isAdmin = function(req, res, next){
    if(req.user.isAdmin){
        next();
    } else {
        req.flash('error', 'This site is now read only thanks to spam and trolls.');
        res.redirect('back');
    }
};

module.exports = middlewareObj;