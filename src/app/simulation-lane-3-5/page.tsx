import type { Metadata } from "next";
import SimulationDashboard from "@/simulation/components/SimulationDashboard";
import { buildTwoLaneRoadLayout } from "@/simulation/engine/physics";

export const metadata: Metadata = {
  title: "Simulation Lane 3.5 m",
  description: "3D overtaking simulation with a 3.5 meter lane width",
};

export default function SimulationLaneThreeFivePage() {
  const roadLayout = buildTwoLaneRoadLayout(3.5);

  return (
    <SimulationDashboard
      subtitle="Motorcycle overtake with a 3.5 m lane width"
      roadLayout={roadLayout}
      initialLane="left"
      carSteeringAngleDeg={5}
      carSteeringDelaySeconds={2}
      initialCarZ={roadLayout.leftLaneCenter - roadLayout.laneWidth / 2 + 2.5}
      initialBikeZ={roadLayout.leftLaneCenter - roadLayout.laneWidth / 4}
      fixedBikeZ={roadLayout.leftLaneCenter - roadLayout.laneWidth / 4}
    />
  );
}
