import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const slideIn = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(243, 156, 18, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(243, 156, 18, 0.8), 0 0 60px rgba(243, 156, 18, 0.6);
  }
`;

const Container = styled(motion.div)`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  min-width: 400px;
  max-width: 80%;
  pointer-events: none;
`;

const AnnouncementBox = styled(motion.div)`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 3px solid #f39c12;
  border-radius: 15px;
  padding: 20px 30px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  animation: ${glow} 2s ease-in-out infinite;
`;

const AnnouncementHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const AnnouncementIcon = styled.span`
  font-size: 24px;
`;

const AnnouncementTitle = styled.h3`
  color: #f39c12;
  margin: 0;
  font-size: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const AnnouncementText = styled.p`
  color: white;
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.5;
`;

const AdminBadge = styled.span`
  background: linear-gradient(45deg, #f39c12, #e67e22);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  margin-left: 10px;
`;

function AnnouncementOverlay({ announcement }) {
  const [visible, setVisible] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);

  useEffect(() => {
    if (announcement) {
      // 새 공지가 오면 이전 공지를 즉시 숨기고 새 공지 표시
      setVisible(false);
      setCurrentAnnouncement(announcement);
      
      // 잠시 후 새 공지 표시 (애니메이션을 위한 짧은 딜레이)
      const showTimer = setTimeout(() => {
        setVisible(true);
      }, 100);
      
      // 5초 후 자동으로 숨기기
      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, 5000); // Show for 5 seconds

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [announcement]);

  return (
    <AnimatePresence mode="wait">
      {visible && currentAnnouncement && (
        <Container
          key={currentAnnouncement.timestamp}
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <AnnouncementBox>
            <AnnouncementHeader>
              <AnnouncementIcon>📢</AnnouncementIcon>
              <AnnouncementTitle>공지사항</AnnouncementTitle>
              <AdminBadge>ADMIN</AdminBadge>
            </AnnouncementHeader>
            <AnnouncementText>{currentAnnouncement.message}</AnnouncementText>
          </AnnouncementBox>
        </Container>
      )}
    </AnimatePresence>
  );
}

export default AnnouncementOverlay;