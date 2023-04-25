module.exports = {
    formatVND: function (number) {
        let str = number.toString();
        let parts = str.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    },
    validatePhone: function (phoneNo) {
        if (!phoneNo || phoneNo.trim().length <= 0) {
            return "Phone number is required";
        }
        if (isNaN(phoneNo)) {
            return "Phone must be a number";
        }
        if (phoneNo.length !== 10) {
            return "Phone number must be 10 digits";
        }
        return "";
    },
    validateAmount: function (amount) {
        if (!amount || amount.toString().trim().length <= 0) {
            return "Amount is required";
        }
        if (isNaN(amount)) {
            return "Amount must be a number";
        }
        if (amount <= 0) {
            return "Amount must be greater than zero";
        }
        return "";
    }
};