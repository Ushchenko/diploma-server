import axios from "axios"
import OpenAIApi from "openai"
import FavBookModel from "../models/FavBook.js"

const instruction = `You are an assistant, that helps find books by user's prompt. Answer only by book's name or it's author and name. Suggest between 4 and 7 books that are relevant to the prompt, and aim for variety—avoid suggesting the most popular classics unless they strongly match the prompt. Make sure all book titles and authors are real and correctly matched. Do not make up books or authors. Only suggest books that are actually published and available, with correct authorship. No invented books or authors. If the user's prompt refers to a book series (e.g. a trilogy or multi-part saga), list the individual titles of the books within that series (instead of just the series name). Do not repeat the same book twice. Answer only on english. Format the answer like this: Title|Author; Title|Author; Title|Author. Do not include numbering, bullet points, or any extra text.`

export const openAI = new OpenAIApi({ apiKey: process.env.OPEN_AI_KEY })

export const findBooks = async (req, res) => {
  try {
    const { prompt } = req.body
    const response = await openAI.responses.create({
      model: 'gpt-4o-mini',
      instructions: instruction,
      input: `${prompt}`,
    })

    console.log("ChatGPT response: ", response.output_text);
    res.status(200).json({
      success: true,
      data: response.output_text
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.response
        ? err.response.data
        : "Server issue"
    })
  }
}

export const findBooksFromGoogle = async (req, res) => {
  try {
    const { title, author, isbn } = req.body;
    console.log("request body", req.body);

    const sanitize = str => str.replace(/["';]+/g, '').trim();

    const cleanTitle = title ? sanitize(title) : null;
    const cleanAuthor = Array.isArray(author)
      ? sanitize(author.join(' '))
      : author
        ? sanitize(author)
        : null;

    let query = '';
    if (isbn) {
      query = `isbn:${isbn}`;
    } else if (cleanTitle || cleanAuthor) {
      if (cleanTitle) query += `intitle:${cleanTitle}`;
      if (cleanAuthor) query += `${query ? '+' : ''}inauthor:${cleanAuthor}`;
    }

    console.log("query: ", query);

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Missing valid title/author or ISBN for search'
      });
    }

    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: query,
        key: process.env.GOOGLE_BOOKS_KEY,
        maxResults: 10
      }
    });

    const items = response.data.items || [];

    const bookCandidate = items.find(item => {
      const info = item.volumeInfo;
      const description = info?.description || '';
      const sentenceCount = description.split(/[.!?]\s/).filter(Boolean).length;

      return sentenceCount > 3;
    });

    if (!bookCandidate) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }

    const info = bookCandidate.volumeInfo;
    const isbn13 = info.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier;

    const fallbackThumb = 'http://books.google.com/books/content?id=G2U4EAAAQBAJ&printsec=frontcover&img=1&zoom=2&edge=curl&source=gbs_api';
    const thumb = info.imageLinks?.thumbnail?.replace(/zoom=\d+/, 'zoom=1') || fallbackThumb;

    const book = {
      id: bookCandidate.id,
      title: info.title,
      authors: info.authors || [],
      isbn13,
      imageLinks: {
        small: thumb,
        medium: thumb.replace(/zoom=1/, 'zoom=2'),
        large: thumb.replace(/zoom=1/, 'zoom=3')
      },
      publishedDate: info.publishedDate || null,
      description: info.description || null,
      infoLink: info.infoLink || null,
      previewLink: info.previewLink || null
    };

    console.log({ success: true });
    res.status(200).json({
      success: true,
      data: book
    });

  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      error: err.response?.data?.error || err.message || 'Server error'
    });
  }
}

export const getAllBooks = async (req, res) => {
  try {
    const books = await FavBookModel.find({ user: req.userId }).exec();
    res.json(books);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to find books"
    })
  }
}

export const getOneBook = async (req, res) => {
  const { isbn } = req.params;
  const userId = req.userId;

  try {
    const book = await FavBookModel.findOne({ user: userId, isbn });

    res.json({ liked: !!book });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to check if the book is liked."
    });
  }
}

export const likeBook = async (req, res) => {
  try {
    const existingFavBook = await FavBookModel.findOne({
      isbn: req.body.isbn,
      user: req.userId
    });

    if (existingFavBook) {
      return res.status(400).json({
        success: false,
        message: 'This book is already saved in your favorites'
      });
    }

    const doc = new FavBookModel({
      isbn: req.body.isbn,
      user: req.userId
    })

    const favBook = await doc.save()

    res.json(favBook)
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.response
        ? err.response.data
        : "Failed to save"
    })
  }
}

export const removeFromFav = async (req, res) => {
  try {
    const bookId = req.params.id

    FavBookModel.findOneAndDelete({
      isbn: bookId,
      user: req.userId
    }).then(doc => {
      if (!doc) {
        return res.status(404).json({
          success: false,
          message: 'Book not found in favorites.',
        });
      }

      res.json({
        success: true
      })
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete"
    })
  }
}