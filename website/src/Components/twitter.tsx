import { BsTwitter } from "react-icons/bs";

export default function Twitter() {
  return (
    <div className="flex justify-center">
      <a
        href="https://twitter.com/JoshCStein"
        rel="noopener nofollow noreferrer"
        target="_blank"
      >
        <button className="flex items-center text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-xl text-sm px-5 py-2.5 text-center mr-2 mb-2 ">
          <BsTwitter />
          &nbsp; JoshCStein
        </button>
      </a>
    </div>
  );
}
