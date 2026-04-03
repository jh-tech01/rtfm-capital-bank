const config = {
  development: {
    API_URL: 'http://localhost:5000/api'
  },
  production: {
    API_URL: process.env.REACT_APP_API_URL || 'https://your-backend-url.onrender.com/api'
  }
};

const environment = process.env.NODE_ENV || 'development';
export default config[environment];