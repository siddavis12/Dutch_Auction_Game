import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Container = styled(motion.div)`
  width: 600px;
  height: 320px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  color: #f39c12;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 2px solid rgba(243, 156, 18, 0.3);
  padding-bottom: 15px;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  color: #ffffff;
  font-size: 13px;
  line-height: 1.5;
  font-family: 'Courier New', monospace;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(243, 156, 18, 0.5);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(243, 156, 18, 0.7);
  }
`;

const LoadingText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #95a5a6;
  font-style: italic;
`;

const ErrorText = styled.div`
  color: #e74c3c;
  text-align: center;
  padding: 20px;
  font-style: italic;
`;

function PatchNotes() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatchNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/patch.txt');
        if (!response.ok) {
          throw new Error('패치 노트를 불러올 수 없습니다.');
        }
        
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatchNotes();
  }, []);

  return (
    <Container
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Header>📋 PATCH NOTES</Header>
      <Content>
        {loading && (
          <LoadingText>
            패치 노트를 불러오는 중...
          </LoadingText>
        )}
        {error && (
          <ErrorText>
            {error}
          </ErrorText>
        )}
        {!loading && !error && (
          <pre style={{ 
            whiteSpace: 'pre-wrap',
            margin: 0,
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit'
          }}>
            {content}
          </pre>
        )}
      </Content>
    </Container>
  );
}

export default PatchNotes;