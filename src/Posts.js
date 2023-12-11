import { useEffect, useState } from "react";
import { Dropdown, Button, Label, TextInput } from "flowbite-react";

import "./Posts.css";

function Posts() {
  const [filteredAsc, setAscFilter] = useState(true);
  const [filteredFavorited, setFavoriteFilter] = useState(true);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState(posts);

  const [newPostUser, setNewPostUser] = useState(1);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("perPage");
    const perPage = JSON.parse(saved);
    return parseInt(perPage) || 10;
  });
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  // Обрабока смены страницы
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Расчет количества страниц
  function pagesDisplay(items) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedItems = items.slice(startIndex, endIndex);

    return displayedItems;
  }

  // Вывод постов из API
  const fetchPosts = () => {
    return fetch("https://jsonplaceholder.typicode.com/posts")
      .then((response) => response.json())
      .then(
        (data) =>
          setPosts(
            data.map((post) => {
              return {
                ...post,
                favorited: false,
              };
            })
          ) &
          setFilteredPosts(
            data.map((post) => {
              return {
                ...post,
                favorited: false,
              };
            })
          )
      )
      .catch((err) => {
        console.log(err);
      });
  };

  // Вывод пользователей из API
  const fetchUsers = () => {
    return fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((data) => setUsers(data));
  };

  // Вывод комментариев из API
  const fetchComments = () => {
    return fetch("https://jsonplaceholder.typicode.com/comments")
      .then((response) => response.json())
      .then((data) => setComments(data));
  };

  // Поиск конкретного пользователя
  function findUserById(userID) {
    return users.find((user) => {
      return user.id === userID;
    });
  }

  // Фильтрация постов по имени пользователя
  function filterByUser(userID) {
    setFilteredPosts([...posts].filter((post) => post.userId === userID));
  }

  // Сортировка в алфавитном порядке
  function alphabetSort() {
    if (filteredAsc === true) {
      setFilteredPosts([...posts].sort((a, b) => (a.title > b.title ? 1 : -1)));
    } else {
      setFilteredPosts([...posts].sort((a, b) => (a.title > b.title ? -1 : 1)));
    }
  }

  // Сортировка постов по отметке нравится
  function sortFavorited() {
    setFilteredPosts([...posts].filter((post) => post.favorited === true));
  }

  // Обработка кнопки алфавитной сортировки
  function changeAscFilter() {
    setAscFilter(!filteredAsc);
    alphabetSort();
  }

  // Обработка кнопки сортировки по отметке нравится
  function changeFavoriteFilter() {
    setFavoriteFilter(!filteredFavorited);
    if (filteredFavorited === true) {
      sortFavorited();
    } else {
      setFilteredPosts(posts);
    }
    setCurrentPage(1);
  }

  // Обработка смены количества постов на одну страницу
  function changePerPage(event) {
    if (event.target.value === "All") {
      setItemsPerPage(parseInt(posts.length));
      localStorage.setItem("perPage", posts.length);
    } else {
      setItemsPerPage(parseInt(event.target.value));
      localStorage.setItem("perPage", event.target.value);
    }
    setCurrentPage(1);
  }

  // Удаление поста
  function deletePost(postID) {
    if (window.confirm("Are you sure you want to delete this post?")) {
      fetch(`https://jsonplaceholder.typicode.com/posts/${postID}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then(
          () =>
            setPosts((posts) => {
              return posts.filter((post) => post.id !== postID);
            }) &
            setFilteredPosts((filteredPosts) => {
              return filteredPosts.filter((post) => post.id !== postID);
            })
        );
    }
  }

  // Добавление нового поста
  function addNewPost() {
    if (newPostTitle && newPostBody) {
      fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        body: JSON.stringify({
          userId: newPostUser,
          id: posts.length,
          title: newPostTitle,
          body: newPostBody,
          favorited: false,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const newPosts = [...posts, data];
          console.log(data);
          setPosts(newPosts);
          setFilteredPosts(newPosts);
          setNewPostUser(1);
          setNewPostTitle("");
          setNewPostBody("");
        });
    }
  }

  // Обработка нажатия на отметку нравится
  function toggleLike(postID) {
    const itemIndex = posts.findIndex((post) => post.id === postID);
    const arr = [...posts];
    arr[itemIndex] = {
      ...arr[itemIndex],
      favorited: !arr[itemIndex].favorited,
    };
    setPosts(arr);
    setFilteredPosts(arr);
  }

  // Обработка нажатия на кнопку комментарии
  const toggleCommentsVisibility = (event) => {
    const parent = event.target.closest(".post-comments");
    const comments = parent.querySelector(".post-comments-items");
    comments.classList.toggle("hide");
  };

  // Обработка нажатия на кнопку добавить пост
  function toggleCreatePost() {
    const form = document.querySelector(".create-post-form");
    form.classList.toggle("hide");
  }
  useEffect(() => {
    fetchUsers();
    fetchPosts();
    fetchComments();
  }, []);
  return (
    <div className="main">
      <div className="container">
        <Button className="main-button" onClick={toggleCreatePost}>
          Create new post
        </Button>
        <form className="create-post-form hide">
          <div className="post-form-items">
            <div className="post-form-item">
              <div className="">
                <Label value="Select user" />
              </div>
              <select
                className="user-selector"
                value={newPostUser}
                onChange={(e) => setNewPostUser(e.target.value)}
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="post-form-item">
              <div className="">
                <Label value="Post title" />
              </div>
              <TextInput
                className="post-form-input"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
            </div>
            <div className="post-form-item">
              <div className="">
                <Label value="Post text" />
              </div>
              <TextInput
                className="post-form-input"
                value={newPostBody}
                onChange={(e) => setNewPostBody(e.target.value)}
              />
            </div>
            <Button className="main-button" onClick={addNewPost}>
              Submit
            </Button>
          </div>
        </form>

        <div className="filter-buttons">
          <Button className="secondary-button" onClick={changeAscFilter}>
            Name
          </Button>
          <Dropdown className="secondary-button users-filter" label="Users">
            {users.map((user) => (
              <Dropdown.Item
                className="user-filter"
                key={user.id}
                onClick={() => filterByUser(user.id)}
              >
                {user.username}
              </Dropdown.Item>
            ))}
          </Dropdown>
          <Button className="secondary-button" onClick={changeFavoriteFilter}>
            Favorites
          </Button>
        </div>
        <div className="pages">
          <div className="per-page-wrapper">
            <div>Posts per page: </div>
            <select value={itemsPerPage} onChange={changePerPage}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={"All"}>All</option>
            </select>
          </div>

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <a
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={pageNumber === currentPage ? "active" : ""}
                >
                  {pageNumber}
                </a>
              )
            )}
          </div>
        </div>

        <div className="posts">
          {pagesDisplay(filteredPosts).map((post) => (
            <div className="post" key={post.id}>
              <div className="post-info">
                <div className="post-title">{post.title}</div>
                <div className="post-user">
                  {findUserById(post.userId)
                    ? findUserById(post.userId).username
                    : ""}
                </div>
                <div className="post-text">{post.body}</div>
              </div>

              <div className="favorite-button-wrapper">
                <Button
                  onClick={() => toggleLike(post.id)}
                  className={
                    post.favorited
                      ? "favorite-button favorited"
                      : "favorite-button"
                  }
                >
                  <svg
                    width="36"
                    height="35"
                    viewBox="0 0 36 35"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g filter="url(#filter0_d_43_140)">
                      <path
                        d="M18.9504 2.12048L20.8479 7.91976C21.2514 9.15284 22.4018 9.98685 23.6992 9.98685H29.8097C30.7802 9.98685 31.1818 11.23 30.3949 11.7978L25.4753 15.3472C24.4165 16.1111 23.9734 17.4721 24.3794 18.713L26.2641 24.4733C26.5652 25.3934 25.5137 26.1616 24.7286 25.5952L19.7553 22.007C18.7073 21.2509 17.2927 21.2509 16.2447 22.007L11.2714 25.5952C10.4863 26.1616 9.43482 25.3934 9.73586 24.4733L11.6206 18.713C12.0266 17.4721 11.5835 16.1111 10.5247 15.3472L5.60514 11.7978C4.81818 11.23 5.21983 9.98685 6.19025 9.98685H12.3008C13.5982 9.98685 14.7486 9.15284 15.1521 7.91976L17.0496 2.12048C17.3502 1.20177 18.6498 1.20177 18.9504 2.12048Z"
                        stroke="#FFA928"
                        strokeWidth="2"
                        shapeRendering="crispEdges"
                      />
                    </g>
                    <defs>
                      <filter
                        id="filter0_d_43_140"
                        x="0.186523"
                        y="0.431396"
                        width="35.627"
                        height="34.3619"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix
                          in="SourceAlpha"
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                          result="hardAlpha"
                        />
                        <feOffset dy="4" />
                        <feGaussianBlur stdDeviation="2" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                        />
                        <feBlend
                          mode="normal"
                          in2="BackgroundImageFix"
                          result="effect1_dropShadow_43_140"
                        />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="effect1_dropShadow_43_140"
                          result="shape"
                        />
                      </filter>
                    </defs>
                  </svg>
                </Button>
              </div>
              <div className="post-buttons">
                <button
                  className="secondary-button"
                  onClick={() => deletePost(post.id)}
                >
                  {" "}
                  Delete Post
                </button>
                <div className={"post-comments"}>
                  <Button onClick={toggleCommentsVisibility}>
                    {"Show comments"}
                  </Button>
                  <div className="post-comments-items hide">
                    Comments:
                    <div className="post-comments-wrapper">
                      {comments.map((comment) => {
                        if (comment.postId === post.id) {
                          return (
                            <div className="post-comment" key={comment.id}>
                              <div className="comment-user">{comment.name}</div>
                              <div className="comment-mail">
                                {comment.email}
                              </div>
                              <div className="comment-text">{comment.body}</div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Posts;
