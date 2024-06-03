// GitHub repository information
const owner = 'Pslkarting';
const repo = 'rss_feed';
const branch = 'main'; // or the branch name you are using
const token = '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'; // Replace with your new personal access token

// Fetch list of blog post files from the repository
async function fetchBlogPosts() {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/?ref=${branch}`;
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}`);
    }

    const files = await response.json();
    console.log('Fetched files:', files);

    // Filter and fetch content of markdown files
    const blogPosts = files.filter(file => file.name.endsWith('.md'));
    console.log('Filtered blog posts:', blogPosts);

    const blogPostContents = await Promise.all(blogPosts.map(async (post) => {
      const contentResponse = await fetch(post.download_url, {
        headers: {
          'Authorization': `token ${token}`
        }
      });

      if (!contentResponse.ok) {
        throw new Error(`Failed to fetch content for ${post.name}`);
      }

      const content = await contentResponse.text();
      return { title: post.name.replace('.md', ''), content };
    }));

    console.log('Fetched blog post contents:', blogPostContents);

    return blogPostContents;

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Display blog posts in the RSS feed format
async function displayBlogPosts() {
  const blogPosts = await fetchBlogPosts();

  if (blogPosts.length === 0) {
    document.getElementById('rss-feed').innerHTML = '<p>No blog posts found or an error occurred.</p>';
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
