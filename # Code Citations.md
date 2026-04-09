git statusgit status# Code Citations

## License: unknown
https://github.com/14zy/14zy.ru/blob/daf84d00263677d475d7dfd3ccdb02bdc478524c/meme-wars/memes.js

```
✅ **Fixed! YouTube links now working in the dashboard.** Here's what I added:

## Changes Made to [AdminDashboard.jsx](frontend/src/pages/AdminDashboard.jsx):

1. **YouTube Video ID Extractor** - Added a helper function that parses YouTube URLs in multiple formats and extracts the video ID for embedding:
   ```javascript
   const getYoutubeVideoId = (url) => {
     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
     const match = url.match(regExp);
     return (match && match[2].length === 11) ? match[2] : null;
   };
   ```

2. **Description Field in Video Form** - Added a missing description textarea input so videos have descriptions displayed in the library

3. **YouTube Preview in Form** - When you enter a YouTube URL in the video form, it now shows a live preview of the embedded video

4. **YouTube Embeds in Movie Cards** - Movies now display the YouTube video embed (140px height) instead of just showing the URL

5. **YouTube Embeds in Video Cards** - Videos now display the YouTube video embed at the top of each card in the library

The dashboard will now properly display any
```


## License: unknown
https://github.com/AlexHenkel/ProyectoAPIS/blob/b100a6d30181f7dfd9f3acee851e197c10301b12/src/Components/Common/VideoUtils.js

```
✅ **Fixed! YouTube links now working in the dashboard.** Here's what I added:

## Changes Made to [AdminDashboard.jsx](frontend/src/pages/AdminDashboard.jsx):

1. **YouTube Video ID Extractor** - Added a helper function that parses YouTube URLs in multiple formats and extracts the video ID for embedding:
   ```javascript
   const getYoutubeVideoId = (url) => {
     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
     const match = url.match(regExp);
     return (match && match[2].length === 11) ? match[2] : null;
   };
   ```

2. **Description Field in Video Form** - Added a missing description textarea input so videos have descriptions displayed in the library

3. **YouTube Preview in Form** - When you enter a YouTube URL in the video form, it now shows a live preview of the embedded video

4. **YouTube Embeds in Movie Cards** - Movies now display the YouTube video embed (140px height) instead of just showing the URL

5. **YouTube Embeds in Video Cards** - Videos now display the YouTube video embed at the top of each card in the library

The dashboard will now properly display any
```

