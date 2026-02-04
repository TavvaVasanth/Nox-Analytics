import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchExcel, handlePublicCSVParse, handleWBS } from "../Utils/utils";

import Card from "../component/Card";
import DoughnutChart from "../component/Doughnut.Chart";
import DropDown from "../component/DropDown";
import BarChart from "../component/BarChart";
import { statusMap } from "../Utils/utils";
import GanttChart from "../component/GanttChart";
import * as XLSX from "xlsx";
import GanttTimeline from "../component/GanttTimeline";
import GanttSchedule from "../component/GanttSchedule";
 
import AnimatedTreeMap from "../component/Charts/AnimatedTreeMap";
import ConnectScatteredplot from "../component/Charts/ConnectScatteredPlot";
import ScatterplotTour from "../component/Charts/ScatterplotTour";
import TemporalGraph from "../component/Charts/TemporalGraph";
import SmoothZoom from "../component/Charts/SmoothZoom";
import BarChartRace from "../component/Charts/BarChartRace";
import BarChartTransitions from "../component/Charts/BarChartTransitions";

 
 
import IndexChart from "../component/Charts/IndexChart";
import StreamGraph from "../component/Charts/StreamGraph.jsx";
import ProjectionBlendCanvas from "../component/Charts/ProjectionBlendCanvas";
import WealthHealthChart from "../component/Charts/WealthHealthChart";
import RotatingGlobe from "../component/Charts/RotatingGlobe";
import ZoomableTreemap from "../component/Charts/ZoomableTreemap";
import ZoomableCirclePacking from "../component/Charts/ZoomableCirclePacking";
import RadialAreaChart from "../component/Charts/RadialAreaChart.jsx";
import RadialStackedBarChart from "../component/Charts/RadialStackedBarChart.jsx";
import Inline from "../component/Charts/Inline.jsx";
import Radial from "../component/Charts/RadialStackedBarChart(Sorted).jsx";
import Voronoi from "../component/Charts/Voronoi.jsx";
import Choropleth from "../component/Charts/Choropleth.jsx";
import BivariateChoropleth from "../component/Charts/BivariateChoropleth.jsx";
import StateChoropleth from "../component/Charts/StateChoropleth.jsx";
import WorldChoropleth from "../component/Charts/WorldChoropleth.jsx";
import WorldMap from "../component/Charts/WorldMap.jsx";
import WorldProjections from "../component/Charts/WorldProjections.jsx";
import LineChart from "../component/Charts/LineChart.Jsx";
import ProjectionComparsion from "../component/Charts/ProjectionComparsion.jsx";
import AntimeridianCutting from "../component/Charts/AntimeridianCutting.jsx";
import Tossit from "../component/Charts/Tissot";
import SolarTerminator from "../component/Charts/SolarTerminator.jsx";
import WorldAirportVoronoi from "../component/Charts/WorldAirportVoronoi.jsx";
import UsAirportVoronoi from "../component/Charts/UsAirportVoronoi.jsx";
import VectorField from "../component/Charts/VectorField.jsx";
import GeoTiff from "../component/Charts/GeoTiff.jsx";

 
 

const Project = () => {
  const { project_id } = useParams();
  const [approved, setApproved] = useState([]);
  const navigate = useNavigate();
  const [completed, setCompleted] = useState([]);
  const [pending, setPending] = useState([]);
  const [newTotal, setTotal] = useState([]);
  const [chartType, setChartType] = useState("Final Status");
  const [chartData, setChartData] = useState({ high: 0, medium: 0, low: 0 });
  const [changeType, setChangeType] = useState({
    enhancement: "",
    newFeature: "",
  });
  const [inProgressItems, setInProgressItems] = useState([]);
  const [data, setData] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [scheduleSheetData, setScheduleSheetData] = useState([]);
  const [fetchNew, setFetchNew] = useState(false)
  let commentChartData;
  const [req,setReq]=useState([])
  const chartOptions = [
    {
      key: "Priority",
      label: "Priority",
      onClick: () => handleChartTypeChange("Priority"),
    },
    {
      key: "Impact",
      label: "Impact",
      onClick: () => handleChartTypeChange("Impact"),
    },
    {
      key: "Final Status",
      label: "Final Status",
      onClick: () => handleChartTypeChange("Final Status"),
    },
  ];

  const chnageType = (data) => {
    let filtedByEnhancement = data.filter(
      (item) => item["Change Type"]?.toLowerCase() === "enhancement"
    );

    let filtedByNewFeature = data.filter(
      (item) => item["Change Type"]?.toLowerCase() === "new feature"
    );

    setChangeType({
      enhancement: filtedByEnhancement.length,
      newFeature: filtedByNewFeature.length,
    });
  };
  const getCommentChartData = (changeRequests) => {
    // Filter the change requests based on the presence of comments
    const withComments = changeRequests.filter((item) => {
      const comment = item["Comments/Notes"];
      return typeof comment === "string" && comment.trim() !== ""; // Non-empty comments
    });

    const withoutComments = changeRequests.filter((item) => {
      const comment = item["Comments/Notes"];
      return typeof comment === "string" && comment.trim() === ""; // Empty comments
    });

    // Now you can return the objects as well as the count data
    return {
      withCommentsData: withComments,
      withoutCommentsData: withoutComments,
      chartData: [
        {
          label: "With Comments",
          value: withComments.length,
          color: "#10b981",
        },
        {
          label: "Without Comments",
          value: withoutComments.length,
          color: "#ef4444",
        },
      ],
    };
  };

  const handleNavigateOfCard = (project_id, label) => {
    // Clean the label (convert to lowercase, remove spaces)

    // Map the cleaned key using statusMap
    const status = statusMap[label] || key; // fallback to the key itself if no mapping exists

    // Navigate with the mapped status
    navigate(`/SuperAdmin/Dashboard/${project_id}/details/${status}`);
  };

 useEffect(() => {
  const normalizeKey = (key) =>
    key
      .replace(/[\n\r↵]/g, ' ') // Replace newline-like characters with space
      .replace(/\s+/g, ' ')     // Collapse multiple spaces
      .trim();                  // Trim surrounding spaces

  const loadData = async () => {
    const data = await handlePublicCSVParse(project_id);

    // Clean keys
    const cleanedData = data.map((row) => {
      const cleanedRow = {};
      for (const key in row) {
        const cleanKey = normalizeKey(key);
        cleanedRow[cleanKey] = row[key];
      }
      return cleanedRow;
    });

    setTotal(cleanedData);

    // Filter logic
    const approvedItems = cleanedData.filter(
      (item) => item["Approval Status"]?.trim().toLowerCase() === "approved"
    );

    const completedItems = cleanedData.filter(
      (item) => item["Final Status"]?.trim().toLowerCase() === "completed"
    );

    const pendingItems = cleanedData.filter(
      (item) => item["Approval Status"]?.trim().toLowerCase() === "pending"
    );

    const inProgressItems = cleanedData.filter(
      (item) => item["Final Status"]?.trim().toLowerCase() === "in progress"
    );

    setApproved(approvedItems);
    setCompleted(completedItems);
    setPending(pendingItems);
    setInProgressItems(inProgressItems);

    // ✅ Updated count logic based on the selected field
    const countLevels = (key) => {
      const result = {};

      if (key === "Priority" || key === "Impact") {
        result.high = cleanedData.filter((item) => item[key]?.toLowerCase() === "high").length;
        result.medium = cleanedData.filter((item) => item[key]?.toLowerCase() === "medium").length;
        result.low = cleanedData.filter((item) => item[key]?.toLowerCase() === "low").length;
      } else if (key === "Final Status") {
        result.completed = cleanedData.filter((item) => item[key]?.toLowerCase() === "completed").length;
        result.inProgress = cleanedData.filter((item) => item[key]?.toLowerCase() === "in progress").length;
      }

      return result;
    };

    const priorityCounts = countLevels("Priority");
    const impactCounts = countLevels("Impact");
    const finalStatusCounts = countLevels("Final Status");

    // Set chart data based on selected chart type
    setChartData(
      chartType === "Priority"
        ? priorityCounts
        : chartType === "Impact"
        ? impactCounts
        : chartType === "Final Status"
        ? finalStatusCounts
        : {}
    );

    // Update any other state if needed
    chnageType(data);
    commentChartData = getCommentChartData(data);
  };

 // Other sheets
  const fetchData = async () => {
    const data = await fetchExcel({
      path: "/WBS-With-Gantt-Chart-25092024.xlsx",
      range: 6,
      columns: ["TASK TITLE", "TASK OWNER", "START DATE", "DUE DATE", "DURATION"],
    });
    setTaskData(data);
  };

  // const fetchData = async () => {
  //   const data = await handleWBS(project_id);
    
    
  //    const cleanedData = data.map((row) => {
  //     const cleanedRow = {};
  //     for (const key in row) {
  //       const cleanKey = normalizeKey(key);
  //       cleanedRow[cleanKey] = row[key];
  //     }
  //     return cleanedRow;
  //   });

  //   setTaskData(cleanedData);
  // };

  const FetchProjectTimeLineSheet = async () => {
    const data = await fetchExcel({
      path: "/Project-Timeline_LimkarEcom(ProjectTimeline).csv",
      range: 30,
      columns: ["CATEGORY", "TASK", "START", "END", "COLOR"],
    });
    setData(data);
  };

  const FetchProjectScheduleSheet = async () => {
    const data = await fetchExcel({
      path: "/Project Schedule_GanttChart_LimkarEcomphase2(GanttChart).csv",
      range: 6,
      columns: ["WBS", "TASK", "LEAD", "START", "END", "DAYS", "% DONE", "WORK DAYS"],
    });
    setScheduleSheetData(data);
  };
  const FetchRequestData=async()=>{
    const data=await fetchExcel({
      path:"/My_Change_Request_Project Sheet (V1).csv",
      columns:["Change Request ID","Priority","Impact","Change Type","Final Status"]
    })
    setReq(data)
  }
  // Load all at once
  fetchData();
  FetchProjectTimeLineSheet();
  FetchProjectScheduleSheet();
  loadData();
  FetchRequestData();
}, [project_id, chartType, fetchNew]);


  useEffect(() => {
    // if (taskData.length > 0) {
    //   console.log("Updated taskData:", taskData);
    // }
    // if (data.length > 0) {
    //   console.log("new Updated taskData:", data);
    // }
    // if (scheduleSheetData.length > 0) {
    //   console.log("Schedule Sheet data:", scheduleSheetData);
    // }
    // if (newTotal.length > 0) {
    //   console.log("Total data:", newTotal);
    // }
    if (taskData.length > 0) {
      console.log("Total data:", taskData);
    }
  }, [taskData]);

  const handleChartTypeChange = (selected) => {
    setChartType(selected);
    const combinedData = approved.concat(completed, pending);

    const counts = (key) => ({
      high: combinedData.filter((item) => item[key]?.toLowerCase() === "high")
        .length,
      medium: combinedData.filter(
        (item) => item[key]?.toLowerCase() === "medium"
      ).length,
      low: combinedData.filter((item) => item[key]?.toLowerCase() === "low")
        .length,
      completed: combinedData.filter(
        (item) => item[key]?.toLowerCase() === "completed"
      ).length,
      inProgress: combinedData.filter(
        (item) => item[key]?.toLowerCase() === "in progress"
      ).length,
    });

    setChartData(counts(selected));
  };

  const idMap = {
    "limkar-ecommerce": "Limkar Ecommerce",
    "thalasa-service-desk": "Thalasa Service Desk",
  };

  return (
    <div className=" rounded-lg min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-8 text-black dark:text-gray-300">
        {idMap[project_id] || "Project Dashboard"}
      </h1>

      <div className="flex justify-between mb-8">{/* Summary Stats */}
      <h1 className="text-xl text-gray-500 font-bold mb-4">
        Overview of Change Requests
      </h1>
      <button
        onClick={() => setFetchNew(prev => !prev)}
        className="px-4 border dark:bg-black shadow-2xl dark:text-white font-semibold rounded hover:bg-gray-700 hover:text-white transition"
      >
     Pull
      </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <Card
          className="border border-gray-300"
          label="Total Requests"
          count={newTotal.length}
          total={newTotal}
          project_id={project_id}
          handleNavigateOfCard={handleNavigateOfCard}
          color="red"
        />
        <Card
          className="border border-gray-300"
          label="Approved Requests"
          count={approved.length}
          approved={approved}
          project_id={project_id}
          handleNavigateOfCard={handleNavigateOfCard}
          color="green"
        />
        <Card
          className="border border-gray-300"
          label="Completed Requests"
          count={completed.length}
          completed={completed}
          project_id={project_id}
          handleNavigateOfCard={handleNavigateOfCard}
          color="blue"
        />
        <Card
          className="border border-gray-300"
          label="Pending Requests"
          count={pending.length}
          pending={pending}
          project_id={project_id}
          handleNavigateOfCard={handleNavigateOfCard}
          color="yellow"
        />
      </div>
      <div></div>
      <div className="flex gap-6">
        {/* Chart */}
        <div className="bg-white shadow-xl flex flex-col justify-between items-center w-[40%] rounded-lg p-6 border border-gray-200 mb-10">
          <div className="flex justify-center gap-2 items-center w-full mb-4">
       

            <h1 className="text-2xl font-bold">Breakdown by</h1>
            <DropDown
              items={chartOptions}
              label={chartType}
              className="border rounded px-3 py-1 flex gap-2 items-center cursor-pointer"
              icon={null}
            />
          </div>
          <div className="w-full h-full flex justify-center items-center">
            <DoughnutChart
              high={chartData.high}
              medium={chartData.medium}
              low={chartData.low}
              completed={chartData.completed}
              inProgress={chartData.inProgress}
            />
          </div>
        </div>

        <div className="bg-white shadow-xl flex flex-col justify-between items-center w-full rounded-lg p-6 border border-gray-200 mb-10">
          <div className="flex  flex-col  justify-center gap-2 items-center w-full mb-4">
            <h1 className="text-2xl font-bold">Breakdown by Change Type</h1>
            <BarChart changeType={changeType} />
          </div>
        </div>
      </div>
      <h1 className="text-xl text-gray-500 font-bold mb-4">
        Overview of Work Breackdown Structure
      </h1>
      <div className="bg-white shadow-xl flex flex-col justify-between items-center w-full rounded-lg p-6 border border-gray-200 mb-10">
        <GanttChart data={taskData} />
      </div>

      <h1 className="text-xl text-gray-500 font-bold mb-4">
        Overview of Project Timeline
      </h1>
      <div className="bg-white shadow-xl flex flex-col justify-between items-center w-full rounded-lg p-6 border border-gray-200 mb-10">
        <GanttTimeline data={data} />
      </div>

      <h1 className="text-xl text-gray-500 font-bold mb-4">
        Overview of Project Schedule
      </h1>
      <div className="bg-white shadow-xl flex flex-col justify-between items-center w-full rounded-lg p-6 border border-gray-200 mb-10">
        <GanttSchedule data={scheduleSheetData} />
      </div>
 
       <AnimatedTreeMap/> 
      <ConnectScatteredplot/> 
      <ScatterplotTour/>
      <TemporalGraph/>
      <SmoothZoom/>
      <BarChartRace/>
      <BarChartTransitions/> 
      <IndexChart/>
      <StreamGraph/>
      <ProjectionBlendCanvas/>
      <WealthHealthChart/>
      <RotatingGlobe/>
      <ZoomableTreemap/>
      <ZoomableCirclePacking/>
      <RadialAreaChart/>
      <div className="bg-white my-4">
        <h3>Radial Stacked Bar Chart</h3>
        <RadialStackedBarChart data={req}/>
      </div>
      <div className="bg-white my-3">
        <h3>InLine Chart</h3>
        <Inline></Inline>
        <LineChart></LineChart>
      </div>
      <div className="bg-white my-3">
        <h3>Radial stacked Bar Chart Sorted</h3>
          <Radial></Radial>
          <Voronoi></Voronoi>
      </div>
      <div className="bg-gray-500">
  <Choropleth />
</div>
<div className="bg-white my-3">
  <BivariateChoropleth></BivariateChoropleth>
  <StateChoropleth></StateChoropleth>
  <WorldChoropleth></WorldChoropleth>
  <WorldMap></WorldMap>
  <WorldProjections></WorldProjections>
  <ProjectionComparsion></ProjectionComparsion>
  <AntimeridianCutting></AntimeridianCutting>
  <Tossit></Tossit>
  <SolarTerminator></SolarTerminator>
  <UsAirportVoronoi></UsAirportVoronoi>
  <WorldAirportVoronoi></WorldAirportVoronoi>
  <VectorField></VectorField>
  <GeoTiff></GeoTiff>

</div>
    </div>
  );
};

export default Project;
