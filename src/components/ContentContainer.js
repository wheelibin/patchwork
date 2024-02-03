import React from "react";
import { Switch, Route } from "react-router-dom";
import Patchwork from "./Patchwork";

const ContentContainer = () => {
  return (
    <Switch>
      <Route exact path="/" component={Patchwork} />
    </Switch>
  );
};

export default ContentContainer;
