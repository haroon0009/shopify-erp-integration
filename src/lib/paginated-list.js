import { ErrorMessage } from '../model/index.js';

const parseHeaderLink = (link) => {
  let nextPageInfo;
  let prevPageInfo;

  if (link) {
    const parentArr = link.split(' ');
    function extractLink(str) {
      const splitStr = str.split('&');
      const pageSplit = splitStr[1].split('=');
      return pageSplit[1];
    }

    if (parentArr.length > 2) {
      prevPageInfo = extractLink(parentArr[0]);
      nextPageInfo = extractLink(parentArr[2]);
    } else {
      if (link.includes('next')) {
        nextPageInfo = extractLink(parentArr[0]);
      }
    }
  }
  return {
    nextPageInfo,
    prevPageInfo,
  };
};

const paginatedList = async ({ service, path, query, service_name }) => {
  try {
    let pageInfo;
    let hasNext = true;
    let allList = [];

    while (hasNext) {
      let url = `${path}?limit=${250}`;
      if (query) url = `${url}&${query}`;

      if (pageInfo) url = url = `${url}&page_info=${pageInfo}`;
      const resp = await service.get(url);
      const lists = resp.data[service_name];
      allList = [...allList, ...lists];
      const { nextPageInfo, prevPageInfo } = parseHeaderLink(resp.headers.link);

      if (nextPageInfo) {
        pageInfo = nextPageInfo.replace('>;', '');
      } else {
        pageInfo = false;
        hasNext = false;
      }
    }

    return allList;
  } catch (error) {
    const msg = new ErrorMessage({
      type: `shopify fetching error ${service_name}`,
      meta_details: error,
    });
    throw new Error(error);
  }
};

export default paginatedList;
