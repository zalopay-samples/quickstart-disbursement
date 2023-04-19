module.exports = {
    formatVND: function (number) {
        let str = number.toString();
        let parts = str.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }
};