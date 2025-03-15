const axios = require("axios");

const MATTERMOST_BASE_URL = "https://mattermost.buildaiengine.com/api/v4"; //base url of your mattermost server

const MATTERMOST_ACCESS_TOKEN = "3zfxpynzntfkdxqkahibqawejw"; // Generate in Mattermost admin panel

const apiClient = axios.create({
  baseURL: MATTERMOST_BASE_URL,
  headers: {
    Authorization: `Bearer ${MATTERMOST_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
});

module.exports = apiClient;
