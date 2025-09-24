# Bar Break-Even Calculator

A simple, mobile-friendly web application that helps bar owners calculate how many drinks they need to sell daily to cover their fixed costs.

## Features

- Calculate daily drink sales needed to break even
- Mobile-responsive design
- Real-time calculations
- Form validation
- Clear error messaging
- Detailed results including:
  - Profit per drink
  - Total monthly drinks needed
  - Daily drinks target
  - Monthly costs breakdown

## Usage

1. Open `index.html` in any modern web browser
2. Enter your costs:
   - Monthly Rent ($)
   - Monthly Labor Costs ($)
   - Cost to Make One Drink ($)
   - Selling Price Per Drink ($)
   - Days Open Per Month (default: 30)
3. Click "Calculate" to see your break-even analysis

## Formulas Used

- Profit per drink = Selling price - Cost to make
- Total monthly costs = Monthly rent + Monthly labor
- Required drinks per day = (Total monthly costs ÷ Profit per drink) ÷ Days open

## Technical Details

- Single HTML file with embedded CSS and JavaScript
- No external dependencies
- Mobile-optimized inputs
- Responsive layout
- Accessible form controls with ARIA attributes
- Client-side validation
- Formatted currency output

## Browser Support

Works in all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Local Development

1. Clone this repository
2. Open `index.html` in your browser
3. Make changes and refresh to see updates

No build process or server required - it's a standalone HTML file.

## License

MIT License - Feel free to use and modify for your needs.