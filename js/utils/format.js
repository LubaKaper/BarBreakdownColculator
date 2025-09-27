export const fmtMoney = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

export const fmtInt = (num) => {
    return Math.ceil(num).toLocaleString('en-US');
};