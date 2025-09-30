FROM node:20

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install


# Install MUI and charting packages
RUN npm install @mui/material@5 @mui/x-date-pickers@6 @emotion/react @emotion/styled @date-io/date-fns@2 date-fns@2 @mui/icons-material@5 react-chartjs-2 chart.js

# Copy all source files including public folder
COPY . .

CMD ["npm", "start"]