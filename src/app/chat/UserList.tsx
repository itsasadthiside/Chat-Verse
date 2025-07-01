'use client';

import React from 'react';

interface Props {
  users: string[];
  selectedUser: string | null;
  setSelectedUser: (user: string) => void;
  unread: Record<string, number>;
  online: string[];
  latestMessages: Record<string, string>;
}

const UserList: React.FC<Props> = ({
  users,
  selectedUser,
  setSelectedUser,
  unread,
  online,
  latestMessages,
}) => {
  return (
    <ul className="user-list">
      {users.map(user => (
        <li
          key={user}
          className={`user-card ${selectedUser === user ? 'active' : ''}`}
          onClick={() => {
            if (selectedUser !== user) setSelectedUser(user);
          }}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${user}&background=random`}
            alt={user}
            className="avatar"
          />
          <div className="info">
            <span className="name">{user}</span>
            <span className="preview">
              {latestMessages[user] ? latestMessages[user].slice(0, 30) + '...' : ''}
            </span>
            <span className={`status ${online.includes(user) ? 'online' : 'offline'}`}>
              {online.includes(user) ? 'Online' : 'Offline'}
            </span>
          </div>
          {unread[user] > 0 && <span className="badge">{unread[user]}</span>}
        </li>
      ))}

      <style jsx>{`
        .user-list {
          list-style: none;
          padding: 10px;
          margin: 0;
          overflow-y: auto;
          flex: 1;
          background: #f4f4f4;
        }

        .user-card {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          gap: 12px;
          background: #fff;
          margin-bottom: 10px;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          transition: background 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid #ddd;
        }

        .user-card:hover {
          background: #eaf4ff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .user-card.active {
          border: 2px solid #1976d2;
          background: #e3f2fd;
        }

        .avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          object-fit: cover;
        }

        .info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .name {
          font-weight: 600;
          font-size: 1rem;
        }

        .preview {
          font-size: 0.85rem;
          color: #666;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status {
          font-size: 0.75rem;
          color: #999;
        }

        .status.online {
          color: green;
        }

        .status.offline {
          color: #aaa;
        }

        .badge {
          background: #ff3d00;
          color: white;
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 20px;
        }
      `}</style>
    </ul>
  );
};

export default UserList;
