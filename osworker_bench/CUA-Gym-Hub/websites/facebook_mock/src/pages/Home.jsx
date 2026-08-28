import React from 'react';
import Sidebar from '../components/Sidebar';
import Rightbar from '../components/Rightbar';
import Feed from '../components/Feed';

const Home = () => {
  return (
    <div className="flex justify-between bg-[#F0F2F5] min-h-screen pt-14">
      <Sidebar />
      <div className="flex-1 flex justify-center lg:pl-[360px] xl:pr-[360px] w-full">
        <Feed />
      </div>
      <Rightbar />
    </div>
  );
};

export default Home;