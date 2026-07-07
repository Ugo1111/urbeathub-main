import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { formatDistanceToNow } from "date-fns";
import "../css/adminUsersPage.css";

const AdminAddToCartPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [displayUsers, setDisplayUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newestCart");
  const [loading, setLoading] = useState(true);
  const [loadCount, setLoadCount] = useState(20);
  const [expandedUsers, setExpandedUsers] = useState({});
  const [recentCartTotal, setRecentCartTotal] = useState(0); // total new items in last 7 days

  const getDateFromTimestamp = (timestamp) => {
    if (!timestamp) return null;
    if (typeof timestamp.toDate === "function") return timestamp.toDate();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);

    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  // -----------------------------------------------------
  // FETCH USERS AND CARTS
  // -----------------------------------------------------
  const fetchAllUsers = async () => {
    try {
      setLoading(true);

      const usersSnap = await getDocs(collection(db, "beatHubUsers"));
      const cartSnap = await getDocs(collection(db, "Cart"));

      const cartItems = cartSnap.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          ...data,
          createdAtDate: getDateFromTimestamp(data.createdAt),
        };
      });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      let totalRecent = 0;

      const users = usersSnap.docs.map(doc => {
        const userData = doc.data();
        const globalCart = cartItems
          .filter(item => item.userId === doc.id)
          .sort((a, b) => (b.createdAtDate?.getTime() || 0) - (a.createdAtDate?.getTime() || 0));
        const latestCartAt = globalCart[0]?.createdAtDate || null;

        const recentCartCount = globalCart.filter(item => item.createdAtDate && item.createdAtDate >= sevenDaysAgo).length;
        totalRecent += recentCartCount;

        return {
          id: doc.id,
          ...userData,
          cart: [...(userData.cart || []), ...globalCart],
          recentCartCount,
          latestCartAt,
          createdAt: userData.createdAt || null,
        };
      });

      setRecentCartTotal(totalRecent);

      // -----------------------------------------------------
      // SORT AND FILTER
      // -----------------------------------------------------
      let filtered = [...users];

      // Move users with recent cart activity to top
      filtered.sort((a, b) => b.recentCartCount - a.recentCartCount);

      // Apply sortOrder for createdAt if needed
      if (sortOrder === "desc" || sortOrder === "asc") {
        filtered.sort((a, b) => {
          const aTime = getDateFromTimestamp(a.createdAt)?.getTime() || 0;
          const bTime = getDateFromTimestamp(b.createdAt)?.getTime() || 0;
          return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
        });
      }

      // Apply filters
      if (sortOrder === "newestCart") {
        filtered = filtered
          .filter(user => user.cart.length > 0)
          .sort((a, b) => (b.latestCartAt?.getTime() || 0) - (a.latestCartAt?.getTime() || 0));
      }
      if (sortOrder === "producersOnly") filtered = filtered.filter(user => user.IsProducer);

      setAllUsers(filtered);
      setDisplayUsers(filtered.slice(0, 20));
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, [sortOrder]);

  // -----------------------------------------------------
  // SEARCH
  // -----------------------------------------------------
  useEffect(() => {
    let filtered = [...allUsers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        const fullName = `${user.first || ""} ${user.last || ""}`.toLowerCase();
        return (
          fullName.includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.id.toLowerCase().includes(term)
        );
      });
    }

    setDisplayUsers(filtered.slice(0, loadCount));
  }, [searchTerm, allUsers, loadCount]);

  const loadMore = () => {
    const nextCount = loadCount + 20;
    setLoadCount(nextCount);
    setDisplayUsers(allUsers.slice(0, nextCount));
  };

  const toggleExpandUser = (id) => {
    setExpandedUsers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (timestamp) => {
    const date = getDateFromTimestamp(timestamp);
    if (!date) return "Unknown";
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getSortLabel = () => {
    if (sortOrder === "newestCart") return "Cart";
    if (sortOrder === "desc") return "Newest First";
    if (sortOrder === "asc") return "Oldest First";
    if (sortOrder === "producersOnly") return "Producers Only";
    return "Default";
  };

  return (
    <div className="admin-users-page">
      <h2>
        Users Cart Monitor{" "}
        {recentCartTotal > 0 && <span style={{ color: "red" }}>★ {recentCartTotal}</span>}
      </h2>
      <p><strong>Total Users:</strong> {allUsers.length}</p>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by name, email or ID"
        className="admin-search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* SORT / FILTER */}
      <div className="admin-sort-shortcuts">
        <button
          type="button"
          className={sortOrder === "newestCart" ? "active" : ""}
          aria-pressed={sortOrder === "newestCart"}
          onClick={() => setSortOrder("newestCart")}
        >
          Cart
        </button>
        <button
          type="button"
          className={sortOrder === "desc" ? "active" : ""}
          aria-pressed={sortOrder === "desc"}
          onClick={() => setSortOrder("desc")}
        >
          Newest First
        </button>
        <span className="admin-active-sort">Showing: {getSortLabel()}</span>
      </div>

      <select
        className="admin-sort-select"
        value=""
        onChange={(e) => setSortOrder(e.target.value)}
      >
        <option value="" disabled>Sort by</option>
        <option value="desc">Newest First</option>
        <option value="asc">Oldest First</option>
        <option value="newestCart">Cart </option>
        <option value="producersOnly">Producers Only</option>
      </select>

      {loading ? <p>Loading users...</p> : (
        <ul>
          {displayUsers.map(user => (
            <li key={user.id} className="user-item">
              <p>
                <strong>Name:</strong> {user.first} {user.last}{" "}
                {user.recentCartCount > 0 && <span style={{ color: "red" }}>★ {user.recentCartCount}</span>}
              </p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Created:</strong> {formatDate(user.createdAt)}</p>
              {user.latestCartAt && <p><strong>Latest Cart Add:</strong> {formatDate(user.latestCartAt)}</p>}

              <button onClick={() => toggleExpandUser(user.id)}>
                {expandedUsers[user.id] ? "Hide Cart" : "View Cart"}
              </button>

              {expandedUsers[user.id] && (
                <div className="user-cart-details">
                  <h4>Cart Items ({user.cart.length})</h4>
                  {user.cart.length === 0 ? <p>No cart items</p> : (
                    <ul className="cart-list">
                      {user.cart.map((item, i) => (
                        <li key={i} className="cart-item">
                          <p><strong>{item.songTitle || item.title || "Untitled track"}</strong></p>
                          <p>{item.license}</p>
                          <p>{item.price}</p>
                          <p><strong>Added:</strong> {formatDate(item.createdAt || item.createdAtDate)}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {displayUsers.length < allUsers.length && (
        <button className="load-more-button" onClick={loadMore}>Load More</button>
      )}

      {displayUsers.length >= allUsers.length && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>No more users.</p>
      )}
    </div>
  );
};

export default AdminAddToCartPage;
