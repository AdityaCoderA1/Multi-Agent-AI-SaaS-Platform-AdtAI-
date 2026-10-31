import redis from "../../../shared/redis/redis.js";

export const getSearchCache = async (conversationId) => {
  const key = `search-cache:${conversationId}`;
  const cached = await redis.get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
};

export const setSearchCache = async (conversationId, results) => {
  const key = `search-cache:${conversationId}`;
  
  // Cache for 1 hour (3600 seconds)
  await redis.set(
    key,
    JSON.stringify(results),
    "EX",
    3600
  );
};
