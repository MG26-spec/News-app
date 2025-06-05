# News Holmes: Your Interactive News Companion

![Screenshot 2025-06-05 112840](https://github.com/user-attachments/assets/98753c5e-5f77-4b0f-8ab7-c38e7466cbb9)


Explore the latest headlines with News Sleuth, a dynamic news application built with Next.js. Dive into a world of information while a curious Sherlock Holmes detective roams the background, interacting with the news cards as if they were the very buildings holding secrets.

## Features that Uncover the Story:

🕵️ **Interactive Sherlock Holmes Detective:** More than just a background element, Sherlock adds a playful touch:
   - **Dynamic Movement:** He walks along the bottom of the screen and cleverly climbs the news cards, treating them as part of his urban landscape.
   - **Hover Easter Egg:** Hover your mouse over Sherlock for a delightful, hidden message!

📰 **Comprehensive News Coverage:**
   - Fetches and presents up-to-the-minute news articles via the News API.
   - Powerful search functionality to find news on any topic.
   - Easy filtering by various categories.

🌃 **Atmospheric Dark Theme:** Enjoy a visually comfortable reading experience, especially during low-light conditions.

## Getting Started: Join the Investigation!

To get this project up and running on your local machine, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/MG26-spec/News-app
    cd news-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or yarn install
    # or pnpm install
    # or bun install
    ```

3.  **Set up your News API Key:**

    This application relies on the [News API](https://newsapi.org/) to fetch news data. You'll need an API key.

    - Sign up for a free API key at [https://newsapi.org/](https://newsapi.org/).
    - Create a file named `.env.local` in the root of your project if it doesn't exist.
    - Add your API key to the file like this:

      ```
      NEXT_PUBLIC_NEWS_API_KEY=YOUR_NEWS_API_KEY
      ```

      *Remember to replace `YOUR_NEWS_API_KEY` with your actual API key.*

4.  **Run the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

    The application will be available at [http://localhost:3000](http://localhost:3000).

## Technologies Used:

-   Next.js (React Framework)
-   Tailwind CSS (for styling)
-   News API (for fetching news data)
-   React Hooks (for managing state and effects)

## Learn More about Next.js:

-   [Next.js Documentation](https://nextjs.org/docs)
-   [Learn Next.js](https://nextjs.org/learn)

## Deploy on Vercel:

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out their [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
