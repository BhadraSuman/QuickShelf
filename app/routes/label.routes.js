const labelControllers = require("../controllers/label.controller");

module.exports = function(router) {

    router.get('/checkin/:mac', labelControllers.checkIn);

    router.post('/update-tag', labelControllers.updateTag);

    router.get('/users', (req, res) => {
        res.send('User list');
    });

    router.post('/users', (req, res) => {
        res.send('Create user');
    });
};