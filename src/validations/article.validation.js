const { z } = require('zod');

const createArticle = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Tiêu đề là bắt buộc' })
      .min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
    content: z
      .string({ required_error: 'Nội dung là bắt buộc' })
      .min(20, 'Nội dung phải có ít nhất 20 ký tự'),
    tags: z.string().optional(), 
  }),
});

const getArticleBySlug = z.object({
  params: z.object({
    slug: z.string({ required_error: 'Slug là bắt buộc' }),
  }),
});

const getArticles = z.object({
  query: z.object({
    page: z.preprocess(
      (val) => (val ? parseInt(val, 10) : 1),
      z.number().min(1).default(1)
    ),
    limit: z.preprocess(
      (val) => (val ? parseInt(val, 10) : 10),
      z.number().min(1).max(100).default(10)
    ),
  }),
});

module.exports = {
  createArticle,
  getArticleBySlug,
  getArticles,
};