const userAuth=(req,res,next) => {
        
    if (['/account', '/wishlist', '/cart'].includes(req.url)) {
        if (!req.session.user) {
            return res.redirect('/signup');
        }
        return next();
    } else if (['/signup', '/login'].includes(req.url)) {
        if (req.session.user) {
            return res.redirect('/home');
        }
        return next();
    }
    return next();
};

module.exports = userAuth;