// GitHub repository information
const owner = 'Pslkarting';
const repo = 'rss_feed';
const branch = 'main'; // or the branch name you are using

// Function to display messages in the overlay
function displayMessage(message) {
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  document.getElementById('rss-feed').appendChild(messageElement);
}

// Fetch list of blog post files from the repository
async function fetchBlogPosts() {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/?ref=${branch}`;

  try {
    displayMessage('Fetching files from GitHub...');
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}`);
    }

    const files = await response.json();
    displayMessage('Fetched files: ' + JSON.stringify(files));

    // Filter and fetch content of markdown files
    const blogPosts = files.filter(file => file.name.endsWith('.md'));
    displayMessage('Filtered blog posts: ' + JSON.stringify(blogPosts));

    const blogPostContents = await Promise.all(blogPosts.map(async (post) => {
      const contentResponse = await fetch(post.download_url);

      if (!contentResponse.ok) {
        throw new Error(`Failed to fetch content for ${post.name}`);
      }

      const content = await contentResponse.text();
      return { title: post.name.replace('.md', ''), content };
    }));

    displayMessage('Fetched blog post contents: ' + JSON.stringify(blogPostContents));

    return blogPostContents;

  } catch (error) {
    displayMessage('Error fetching blog posts: ' + error.message);
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Display blog posts in the RSS feed format
async function displayBlogPosts() {
  const blogPosts = await fetchBlogPosts();

  if (blogPosts.length === 0) {
    displayMessage('No blog posts found or an error occurred.');
    return;
  }

  let html = '<ul>';
  blogPosts.forEach(post => {
    html += `<li>
               <h3>${post.title}</h3>
               <p>${post.content}</p>
             </li>`;
  });
  html += '</ul>';
  document.getElementById('rss-feed').innerHTML = html;
}

// Run the function to display blog posts
displayBlogPosts();
