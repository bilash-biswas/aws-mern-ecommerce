// client/src/utils/reviewUtils.ts
import { ReviewUser, Review } from '@/types/product';

export const getReviewUser = (review: Review): ReviewUser => {
  // If user is already populated (object), return it
  if (typeof review.user === 'object' && review.user !== null && '_id' in review.user) {
    return review.user as ReviewUser;
  }
  
  // If user is a string (ID), create a minimal user object with the name from the review
  return {
    _id: typeof review.user === 'string' ? review.user : '',
    name: review.name || 'Anonymous'
  };
};

export const isUserPopulated = (user: ReviewUser | string): user is ReviewUser => {
  return typeof user === 'object' && user !== null && '_id' in user;
};

export const getUserId = (user: ReviewUser | string): string => {
  return isUserPopulated(user) ? user._id : user;
};

export const getUserName = (user: ReviewUser | string): string => {
  if (isUserPopulated(user)) {
    return user.name;
  }
  return 'Anonymous';
};