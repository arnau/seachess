import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import Layout from '../components/layout'
// import UserInfo from "../components/UserInfo/UserInfo";
// import Disqus from "../components/Disqus/Disqus";
// import PostTags from "../components/PostTags/PostTags";
// import SocialLinks from "../components/SocialLinks/SocialLinks";
import Meta from '../components/meta'
// import config from "../../data/SiteConfig";
// import "./b16-tomorrow-dark.css";
// import "./post.css";

function Note({data, pageContext}) {
  const { slug } = pageContext
  const note = data.markdownRemark
  const meta = note.frontmatter

  return (
    <Layout>
      <div>
        {/* <SEO title={post.title} postPath={slug} postNode={postNode} postSEO /> */}
        <Meta title={note.headings[0].value} />
        <div>
          <div dangerouslySetInnerHTML={{ __html: note.html }} />
          <div className="post-meta">
            {meta.date}
            {/* <PostTags tags={meta.tags} /> */}
            {/* <SocialLinks postPath={slug} postNode={postNode} /> */}
          </div>
          {/* <UserInfo config={config} /> */}
          {/* <Disqus postNode={postNode} /> */}
        </div>
      </div>
    </Layout>

  )
}

Note.propTypes = {
  data: PropTypes.object,
  pageContext: PropTypes.object,
}

/* eslint no-undef: "off" */
export const query = graphql`
  query NoteBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      timeToRead
      excerpt
      frontmatter {
        date
        tags
      }
      fields {
        slug
      }
      headings(depth: h1) {
        value
      }
    }
  }
`

export default Note
