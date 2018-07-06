async function getData(file) {
  return fetch(file)
    .then(res => res.json())
    .then(dataJson => dataJson);
}

async function main() {
  const thlData = await getData('data/National Institute for Health and Welfare.json');

  // ***** TreeChart *****

  const treeConfig = {
    margin: {
      top: 25,
      right: 400,
      bottom: 25,
      left: 225,
    },

    width: 1400,
    height: 1000,

    animationDuration: 750,
    nodeSize: 10,
  };

  const treeSVG = d3.select('body').append('svg');

  const treeChart = new TreeChart(thlData, treeSVG, treeConfig);
  treeChart.updateNodes();
  treeChart.updateLinks();

  treeChart.collapseLevel(2);

  // ***** Timelines *****

  const timelineConfig = {
    width: 400,
    height: 100,
    showXAxis: false,
  };
  console.log(treeChart.treeData);
  treeChart.treeData.children.forEach((registerNode) => {
    registerNode.children.forEach((categoryNode, idx) => {
      let timelineData = categoryNode.data.samplings;
      // const scaleStartDate = new Date(d3.min(timelineData, el => el.startDate));
      // const scaleEndDate = new Date(d3.max(timelineData, el => el.endDate));
      const parentsData = timelineData.filter(el => el.parents);
      const subjectsData = timelineData.filter(el => !el.parents);
      timelineData = [
        {
          type: 'parents',
          data: parentsData,
        },
        {
          type: 'subjects',
          data: subjectsData,
        },
      ];
      // const timelineConfigExtended = { ...timelineConfig, scaleStartDate, scaleEndDate };
      const categoryTimeline = new CategoryTimeline(timelineData, treeSVG, timelineConfig);
      categoryTimeline.moveTo(categoryNode.y + 310, categoryNode.x - 15); // NOTE: the tree structure kind of swap x and y coords
      categoryTimeline.update();
    });
  });
}

main();
