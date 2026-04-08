const posts = [
  {
    id: 101,
    userId: 1,
    image: "https://picsum.photos/300/200",
    caption: "Building my first startup 🚀",
    likes: 5,
    comments: [
      {
        id: 1,
        userId: 2,
        text: "Amazing idea!",
        createdAt: "2026-02-01"
      }
    ],
    createdAt: "2026-02-01"
  },
  {
    id: 102,
    userId: 2,
    image: "https://picsum.photos/300/200",
    caption: "New UI design inspiration 🎨",
    likes: 3,
    comments: [],
    createdAt: "2026-02-02"
  }
];

export default posts;