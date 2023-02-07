const acontroller = require("./controllers/author");
const bcontroller = require("./controllers/book");
const mq=require("./controllers/mq")
const Joi = require("joi");

module.exports = [
  {
    method: "GET",
    path: "/api/v1/authors",
    handler: acontroller.getallauthor,
  },
  {
    method: "GET",
    path: "/api/v1/authors/{authorid}",
    handler: acontroller.getoneauthor,
    options: {
      validate: {
        params: Joi.object({
          authorid: Joi.number().integer().required(),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/api/v1/authors",
    handler: acontroller.postauthor,
    options: {
      validate: {
        payload: Joi.object({
          authorname: Joi.string().min(3).max(100).required(),
          authoraddress: Joi.string().min(10).max(100).required(),
          authorphone: Joi.string()
          .length(10)
          .pattern(/^[0-9]+$/)
          .required(),
        }),
      },
    },
  },
  {
    method: "PUT",
    path: "/api/v1/authors/{authorid}",
    handler: acontroller.putauthor,
    options: {
      validate: {
        params: Joi.object({
          authorid: Joi.number().integer().required(),
        }),
        payload: Joi.object({
          authoraddress: Joi.string().min(5).max(100).required(),
          authorphone: Joi.string()
            .length(10)
            .pattern(/^[0-9]+$/)
            .required(),
        }),
      },
    },
  },
  {
    method: "DELETE",
    path: "/api/v1/authors/{authorid}",
    handler: acontroller.deleteauthor,
    options: {
      validate: {
        params: Joi.object({
          authorid: Joi.number().integer().required(),
        }),
      },
    },
  },
  /* {
    method: "GET",
    path: "/api/v1/authors/join/{authorid}",
    handler: acontroller.getresults,
    options: {
      validate: {
        params: Joi.object({
          authorid: Joi.number().integer().required(),
        }),
      },
    },
  }, */
  {
    method: "GET",
    path: "/api/v1/authors/subquery/{authorname}",
    handler: acontroller.getresults,
    options: {
      validate: {
        params: Joi.object({
          authorname: Joi.string().min(3).max(100).required(),
        }),
      },
    },
  },

  //books
  { method: "GET", path: "/api/v1/books", handler: bcontroller.getallbooks },

  {
    method: "GET",
    path: "/api/v1/books/{bookid}",
    handler: bcontroller.getonebook,
    options: {
      validate: {
        params: Joi.object({
          bookid: Joi.number().integer().required(),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/api/v1/books",
    handler: bcontroller.postbook,
    options: {
      validate: {
        payload: Joi.object({
          bookname: Joi.string().min(3).max(100).required(),
          publishername:Joi.string().min(3).max(100).required(),
          category:Joi.string().min(3).max(100).required(),
          copies:Joi.number().integer().required(),
          rating:Joi.number().integer().required(),
          published_date:Joi.date().required(),
          authorid:Joi.number().integer().required()
        }),
      },
    },
  },
  {
    method: "PUT",
    path: "/api/v1/books/{bookid}",
    handler: bcontroller.putbook,
    options: {
      validate: {
        params: Joi.object({
          bookid: Joi.number().integer().required(),
        }),
        payload: Joi.object({
          bookname: Joi.string().min(5).max(100).required(),
        }),
      },
    },
  },
  {
    method: "DELETE",
    path: "/api/v1/books/{bookid}",
    handler: bcontroller.deletebook,
    options: {
      validate: {
        params: Joi.object({
          bookid: Joi.number().integer().required(),
        }),
      },
    },
  },
  { method: "GET", path: "/api/v1/emailmq", handler: mq.mail },
];

