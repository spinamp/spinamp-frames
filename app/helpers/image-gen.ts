export const makeTrackFrameImageURL = (trackImageIPFSHash: string, trackTitle: string, artistName: string) => {
  return `https://res.cloudinary.com/spinamp-prod/image/upload/c_fill,h_450,w_600/l_icj2i9l7buaqgysbkjov/c_scale,h_150,w_600/fl_layer_apply,y_300/l_mswxugaoxwes9etdnelw/c_scale,h_100,w_100/fl_layer_apply,x_-200,y_225/co_rgb:FFFFFF,l_text:helvetica_26_bold_normal_left:${trackTitle}/fl_layer_apply,g_west,x_170,y_200/co_rgb:FFFFFF,l_text:helvetica_20_normal_left:${artistName}/fl_layer_apply,g_west,x_170,y_240/ipfs_image/${trackImageIPFSHash}`
}
