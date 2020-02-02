module.exports = {
  siteMetadata: {
    title: 'Seachess',
    siteUrl: 'https://www.seachess.net',
  },
  mapping: {
    'MarkdownRemark.frontmatter.author': 'Author.id',
    // 'Sketch.author': 'Author.id'
  },
  plugins: [
    // 'gatsby-plugin-no-sourcemaps',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sitemap',
    'gatsby-plugin-material-ui',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-feed',
      options: {
        query: `
          {
            settings {
              title
              description
              url
              copyright
            }
          }
        `,
        setup: ({ query: { settings, ...rest }}) => {
          return {
            ...settings,
            ...rest,
          }
        },
        feeds: [
          {
            serialize: ({ query: { settings, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map(edge => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: edge.node.frontmatter.date,
                  url: settings.url + edge.node.fields.slug,
                  guid: settings.url + edge.node.fields.slug,
                  copyright: settings.copyright,
                  // custom_elements: [{ 'content:encoded': edge.node.html }],
                })
              })
            },
            query: `
              {
                allMarkdownRemark(
                  filter: { frontmatter: { type: {eq: "note"}}}
                  sort: { fields: [frontmatter___date], order: DESC }
                ) {
                  edges {
                    node {
                      excerpt(format: HTML, pruneLength: 100)
                      html
                      fields { slug }
                      frontmatter {
                        title
                        date
                      }
                    }
                  }
                }
              }
            `,
            output: '/rss.xml',
            title: 'Seachess RSS Feed',
          },
          {
            serialize: ({ query: { settings, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map(edge => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.html,
                  date: edge.node.frontmatter.date,
                  url: settings.url + edge.node.fields.slug,
                  guid: settings.url + edge.node.fields.slug,
                  copyright: settings.copyright,
                  // custom_elements: [{ 'content:encoded': edge.node.html }],
                })
              })
            },
            query: `
              {
                allMarkdownRemark(
                  filter: { frontmatter: { type: {eq: "bulletin"}}}
                  sort: { fields: [frontmatter___date], order: DESC }
                ) {
                  edges {
                    node {
                      html
                      fields { slug }
                      frontmatter {
                        title
                        date
                      }
                    }
                  }
                }
              }
            `,
            output: '/bulletins/rss.xml',
            title: 'Seachess Bulletin RSS Feed',
          },
        ],
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'sketches',
        path: `${__dirname}/sketches`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'data',
        path: `${__dirname}/data`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'notes',
        path: `${__dirname}/notes`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'bulletins',
        path: `${__dirname}/bulletins`,
      },
    },
    '@arnau/gatsby-transformer-toml',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        excerpt_separator: '<!-- end -->',
        plugins: [
          {
            resolve: 'gatsby-remark-curlie',
            options: {
              db: [
                {id: 'example', 'url': 'https://example.org/'},
                {id: 'curie', 'url': 'https://www.w3.org/TR/curie', 'publisher': 'W3C', 'published': '2010'},
                {id: 'url', 'url': 'https://url.spec.whatwg.org/#', 'publisher': 'WHATWG'},
              ]
            }
          },
          'gatsby-remark-rfc8288',
          'gatsby-remark-graphviz',
          'gatsby-remark-copy-linked-files',
          'gatsby-remark-autolink-headers',
          {
            resolve: 'gatsby-remark-external-links',
            options: {
              target: '_self',
              rel: 'nofollow noopener'
            }
          },
          {
            resolve: 'gatsby-remark-component',
            options: { components: ['my-component', 'other-component'] }
          },
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              showLineNumbers: true,
              noInlineHighlight: false,
            }
          },
          {
            resolve: 'gatsby-remark-images',
            options: {
              // It's important to specify the maxWidth (in pixels) of
              // the content container as this plugin uses this as the
              // base for generating different widths of each image.
              maxWidth: 590,
            },
          }
        ]
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // 'gatsby-plugin-offline',
  ],
}
