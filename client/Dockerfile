# Builder image for the frontend
FROM node:18 as build

WORKDIR /client

## Set the working directory and copy the source code
WORKDIR /client/

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN npm install

# Copy the entire application code to the container
COPY . .

# Build the React app for production
RUN npm run build

FROM nginx:alpine

COPY --from=build /client/build /usr/share/nginx/html

EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]