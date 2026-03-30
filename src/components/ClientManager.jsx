"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import ContentModal from './ContentModal';
import Home from './Home';
import VideosArchive from './VideosArchive';
import ArticlesArchive from './ArticlesArchive';
import PodcastsArchive from './PodcastsArchive';
import { fetchPosts } from '../utils/api';

// ADDED proToolsMenu and connectMenu to the props
export default function ClientManager({ initialPosts, activeSport, currentView, initialHasMore, autoOpenItem, proToolsMenu, connectMenu }) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState(autoOpenItem || null);
  const [wpPosts, setWpPosts] = useState(initialPosts);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);

  const handleSelectItem = (item) => {
    if (item) {
      setSelectedItem(item);
      const itemView = item.view || (item.type === 'article' ? 'articles' : item.type === 'podcast' ? 'podcasts' : 'videos');
      const newPath = `/${item.sport.toLowerCase()}/${itemView}/${item.slug}`;
      window.history.pushState(null, '', newPath);
    } else {
      setSelectedItem(null);
      const basePath = `/${activeSport.toLowerCase()}/${currentView}`;
      window.history.pushState(null, '', basePath);
    }
  };

  useEffect(() => {
    if (autoOpenItem) setSelectedItem(autoOpenItem);
  }, [autoOpenItem]);

  useEffect(() => {
    setWpPosts(initialPosts);
    setCurrentPage(1);
    setHasMore(initialHasMore);
  }, [initialPosts, activeSport, currentView]);

  const loadMorePosts = async () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      try {
        const targetType = currentView === 'home' ? 'all' : (currentView === 'podcasts' ? 'shows' : currentView);
        const { posts, totalPages } = await fetchPosts(activeSport, targetType, nextPage);
        
        setWpPosts(prev => {
          const combined = [...prev, ...posts];
          const uniqueIds = new Set();
          return combined.filter(p => {
            if (uniqueIds.has(p.id)) return false;
            uniqueIds.add(p.id);
            return true;
          });
        });
        
        setCurrentPage(nextPage);
        setHasMore(nextPage < totalPages);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const timelinePosts = wpPosts.filter(p => !p.isMasterShow);
  const articlePosts = timelinePosts.filter(p => p.type === 'article');
  const videoPosts = timelinePosts.filter(p => p.type === 'video' || p.type === 'short');
  const masterPodcasts = wpPosts.filter(p => p.isMasterShow).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      <Header activeSport={activeSport} />
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-10 flex flex-col lg:flex-row gap-8 w-full">
        {/* PASSED MENUS TO SIDEBAR */}
        <Sidebar activeSport={activeSport} proToolsMenu={proToolsMenu} connectMenu={connectMenu} />
        <div className="flex-1 w-full min-w-0">
          {currentView === 'home' && (
            <Home wpPosts={timelinePosts} masterPodcasts={masterPodcasts} activeSport={activeSport} setSelectedItem={handleSelectItem} isLoading={false} />
          )}
          {currentView === 'videos' && (
            <VideosArchive videos={videoPosts} activeSport={activeSport} setSelectedItem={handleSelectItem} loadMorePosts={loadMorePosts} isLoadingMore={isLoadingMore} />
          )}
          {currentView === 'articles' && (
            <ArticlesArchive articles={articlePosts} activeSport={activeSport} setSelectedItem={handleSelectItem} loadMorePosts={loadMorePosts} isLoadingMore={isLoadingMore} />
          )}
          {currentView === 'podcasts' && (
            <PodcastsArchive podcasts={masterPodcasts} activeSport={activeSport} setSelectedItem={handleSelectItem} />
          )}
        </div>
      </div>
      {selectedItem && (
        <ContentModal selectedItem={selectedItem} setSelectedItem={() => handleSelectItem(null)} videos={timelinePosts} />
      )}
    </>
  );
}