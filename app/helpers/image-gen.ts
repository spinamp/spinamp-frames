export const makeTrackFrameImageURL = (
  trackImageIPFSHash: string,
  trackTitle: string,
  artistName: string
) => {
  return `https://content.spinamp.xyz/spinamp-prod/image/upload/c_fill,h_450,w_600/l_icj2i9l7buaqgysbkjov/c_scale,h_150,w_600/fl_layer_apply,y_300/l_mswxugaoxwes9etdnelw/c_scale,h_100,w_100/fl_layer_apply,x_-200,y_225/l_nsbiafuxqisj4li5b9vp/c_scale,h_40,w_20/fl_layer_apply,x_-200,y_280/co_rgb:FFFFFF,l_text:helvetica_26_bold_normal_left:${trackTitle}/fl_layer_apply,g_west,x_170,y_200/co_rgb:FFFFFF,l_text:helvetica_20_normal_left:${artistName}/fl_layer_apply,g_west,x_170,y_240/ipfs_image/${trackImageIPFSHash}`;
};

// currently doesn't meet the design and is not in use
export const makeCollectedFrameImageURL = (
  trackTitle: string,
  artistName: string
) => {
  const firstLine = "Congratulations";
  const secondLine = `You are the owner of ${trackTitle} by ${artistName}. Let's celebrate!`;

  return (
    `https://content.spinamp.xyz/spinamp-prod/image/upload/` +
    // `l_ipfs_image/Qma9bvCyW635Ce5b7fZWwAaXvWL2iG3YRsh1BvqfABcrXR.gif,` +
    // `co_rgb:FFFFFF,l_text:helvetica_26_bold_normal_left:${trackTitle}/fl_layer_apply,g_west,x_170,y_200,` +
    // // `co_rgb:FFFFFF,l_text:helvetica_20_normal_left:${encodedArtistName}/fl_layer_apply,g_west,x_170,y_240,` +
    // `fl_animated,fl_lossy,f_auto/q_auto`
    "/c_fit,h_400,w_400" +
    `/co_rgb:1f4a4f,l_text:helvetica_26_bold_normal_left:${firstLine}/fl_layer_apply,y_100` +
    `/c_scale,h_200,w_200/ipfs_image/Qma9bvCyW635Ce5b7fZWwAaXvWL2iG3YRsh1BvqfABcrXR`
  );
};

// content.spinamp.xyz/spinamp-prod/image/upload/c_fit,h_400,w_400/co_rgb:1f4a4f,l_text:helvetica_26_bold_normal_left:Congratulations/fl_layer_apply,y_100/c_scale,h_100,w_100/ipfs_image/Qma9bvCyW635Ce5b7fZWwAaXvWL2iG3YRsh1BvqfABcrXR
