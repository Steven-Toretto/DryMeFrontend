import React from "react";
import Hero from "../components/Hero";
import Content from "../components/Content"; 

function Home() {
  return (
    <div>
      <Hero />
      <Content />   
      {/* other home-specific sections */}
    </div>
  );
}

export default Home;
