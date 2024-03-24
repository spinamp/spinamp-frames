import { formatUnits } from "ethers/lib/utils";

export const makeTrackFrameImageURL = (
  trackImageIPFSHash: string,
  trackTitle: string,
  artistName: string,
  isCollectable: boolean,
  mintResult: any
) => {
  const priceString =
    isCollectable && mintResult
      ? `${formatUnits(
        mintResult.price.value,
        Number.parseInt(mintResult.price.asset.decimals)
      )} ${mintResult.price.asset.symbol}`
      : 'NOT COLLECTABLE or SOLD OUT - Try on Spinamp';
  const price = `/co_rgb:e0a307,l_text:poppins_16_regular_left:${priceString}/fl_layer_apply,g_west,x_110,y_285`;

  return (
    `https://content.spinamp.xyz/spinamp-prod/image/upload/c_fill,h_510,w_600` +
    `/l_icj2i9l7buaqgysbkjov/c_scale,h_90,w_600/fl_layer_apply,g_north,y_510` + // bottom bar
    `/l_ynn1e8xpat6csimlnt1a.svg/c_scale,h_40,w_40/fl_layer_apply,g_west,x_545,y_273` + // spinamp logo
    `/l_smhrgcjdft2df36n5nmu.svg/c_scale,h_70,w_50/fl_layer_apply,g_north,x_-240,y_530` + // play icon
    `/co_rgb:FFFFFF,l_text:poppins_26_regular_left:${trackTitle}/fl_layer_apply,g_west,x_110,y_235` + // title
    `/co_rgb:FFFFFF,l_text:poppins_20_regular_left:${artistName}/fl_layer_apply,g_west,x_110,y_260` + // artist
    price +
    `/ipfs_image/${trackImageIPFSHash}` // album art
  );
};

export const makeListenFrameImageURL = (
  trackImageIPFSHash: string,
  trackTitle: string,
  artistName: string,
  isCollectable: boolean,
  mintResult: any
) => {
  const topText = "Song delivered to your phone ⬆";
  const priceString =
    isCollectable && mintResult
      ? `${formatUnits(
        mintResult.price.value,
        Number.parseInt(mintResult.price.asset.decimals)
      )} ${mintResult.price.asset.symbol}`
      : "SOLD OUT";
  const price = `/co_rgb:e0a307,l_text:poppins_16_regular_left:${priceString}/fl_layer_apply,g_west,x_110,y_285`;

  return (
    `https://content.spinamp.xyz/spinamp-prod/image/upload/c_fill,h_510,w_600` +
    `/l_houhhgqfqc30he5fea47.svg/c_scale,h_78,w_361/fl_layer_apply,g_north,y_50` + // delivered bubble
    `/l_icj2i9l7buaqgysbkjov/c_scale,h_90,w_600/fl_layer_apply,g_north,y_510` + // bottom bar
    `/l_ynn1e8xpat6csimlnt1a.svg/c_scale,h_40,w_40/fl_layer_apply,g_west,x_545,y_273` + // spinamp logo
    `/l_d45btlryyp0dxtsmyezr.svg/c_scale,h_70,w_50/fl_layer_apply,g_north,x_-240,y_530` + // collect icon
    `/co_rgb:FFFFFF,l_text:poppins_26_regular_left:${trackTitle}/fl_layer_apply,g_west,x_110,y_235` + // title
    `/co_rgb:FFFFFF,l_text:poppins_20_regular_left:${artistName}/fl_layer_apply,g_west,x_110,y_260` + // artist
    price +
    `/ipfs_image/${trackImageIPFSHash}` // album art
  );
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
    // `co_rgb:FFFFFF,l_text:poppins_26_bold_regular_left:${trackTitle}/fl_layer_apply,g_west,x_170,y_200,` +
    // // `co_rgb:FFFFFF,l_text:poppins_20_regular_left:${encodedArtistName}/fl_layer_apply,g_west,x_170,y_240,` +
    // `fl_animated,fl_lossy,f_auto/q_auto`
    "/c_fit,h_400,w_400" +
    `/co_rgb:1f4a4f,l_text:poppins_26_bold_regular_left:${firstLine}/fl_layer_apply,y_100` +
    `/c_scale,h_200,w_200/ipfs_image/Qma9bvCyW635Ce5b7fZWwAaXvWL2iG3YRsh1BvqfABcrXR`
  );
};

// content.spinamp.xyz/spinamp-prod/image/upload/c_fit,h_400,w_400/co_rgb:1f4a4f,l_text:poppins_26_bold_regular_left:Congratulations/fl_layer_apply,y_100/c_scale,h_100,w_100/ipfs_image/Qma9bvCyW635Ce5b7fZWwAaXvWL2iG3YRsh1BvqfABcrXR
