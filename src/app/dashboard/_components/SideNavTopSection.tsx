import { ChevronDown, LayoutGrid, LogOut, Users, Users2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import { Separator } from "@/components/ui/separator";
import { useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { setTeamInfo } from "@/app/Redux/Team/team-slice";
import RenameTeamModal from "@/components/shared/RenameTeamModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MembersList from "@/components/shared/MembersList";
import axiosInstance from "@/config/AxiosInstance";
import { getTeamMembersData } from "@/lib/API-URLs";

export interface TEAM {
  createdBy: string;
  teamName: String;
  _id: String;
  teamMembers?: string[];
}
function SideNavTopSection({ user, setActiveTeamInfo }: any) {
  const menu = [
    {
      id: 1,
      name: "Create Team",
      path: "/teams/create",
      icon: Users,
    },
    // {
    //   id: 2,
    //   name: "Settings",
    //   path: "/dashboard/profile",
    //   icon: Settings,
    // },
  ];
  const router = useRouter();
  const convex = useConvex();
  const dispatch = useDispatch();
  const [activeTeam, setActiveTeam] = useState<TEAM>();
  const [teamList, setTeamList] = useState<TEAM[]>();
  const [userData, setUserdata] = useState<any>();
  const [teamMembersData, setTeamData] = useState<any[]>([]);
  const [ActiveTeamMembers, setActiveTeamMembers] = useState<string[]>([]);

  useEffect(() => {
    user && getTeamList();
  }, [user]);

  useEffect(() => {
    const getData = async () => {
      const result = await convex.query(api.user.getUser, {
        email: user?.email!,
      });
      setUserdata(result[0]);
    };
    if (user) {
      getData();
    }
  }, [user]);

  useEffect(() => {
    const getData = async () => {
      if (ActiveTeamMembers) {
        const res = await axiosInstance.get(`${getTeamMembersData}/${activeTeam?._id}`);
        console.log(res.data);

        setTeamData(res.data.memberData);
      }
    };

    if (teamList && activeTeam) {
      getData();
    }
  }, [ActiveTeamMembers, activeTeam]);

  useEffect(() => {
    activeTeam ? setActiveTeamInfo(activeTeam) : null;
  }, [activeTeam]);
  const getTeamList = async () => {
    const res = await convex.query(api.teams.getAllTeam);
    const allTeams = res.filter(
      (file: { createdBy: any; teamMembers: string | any[] }) =>
        file.createdBy === user.email || file.teamMembers?.includes(user.email)
    );
    setTeamList(allTeams);
    setActiveTeam(allTeams[0]);
    setActiveTeamMembers(allTeams[0].teamMembers);
    dispatch(
      setTeamInfo({ teamId: allTeams[0]._id, teamName: allTeams[0].teamName })
    );
  };

  const onMenuClick = (item: any) => {
    if (item.path) {
      router.push(item.path);
    }
  };

  return (
    <div className=" overflow-hidden">
      <Popover>
        <PopoverTrigger>
          <div className="flex items-center gap-3 hover:bg-secondary p-3 rounded-lg cursor-pointer">
            <Image
              src="/android-chrome-192x192.png"
              alt="logo"
              width={40}
              height={40}
            />
            <h2 className="flex gap-2 items-centerfont-bold text-[13px] md:text-[17px]">
              {activeTeam?.teamName || "Team"}
              <ChevronDown />
            </h2>
          </div>
        </PopoverTrigger>
        <PopoverContent className="ml-7 p-4">
          {/* Team Section  */}
          <div>
            {teamList?.map((team, index) => (
              <div
                key={index}
                className={`p-2 hover:bg-primary flex items-center justify-between rounded-lg mb-1 cursor-pointer
                         ${activeTeam?._id == team._id && "bg-primary text-white"}`}
                onClick={() => {
                  dispatch(
                    setTeamInfo({ teamName: team.teamName, teamId: team._id })
                  );
                  setActiveTeam(team);
                  setActiveTeamMembers(team?.teamMembers!);
                }}
              >
                <h2 className=" font-semibold">{team.teamName}</h2>
                <h2 className="text-gray-400 flex items-center justify-center gap-2">
                  {team.createdBy === user.email ? (
                    "Owner"
                  ) : (
                    <>
                      <Users2 className="w-5 h-5" />
                      {team.teamMembers?.length}
                    </>
                  )}
                </h2>
              </div>
            ))}
          </div>
          <Separator className="mt-2" />
          {/* Option Section  */}
          <div>
            {menu.map((item, index) => (
              <h2
                key={index}
                className="flex gap-2 items-center
                        p-2 hover:bg-secondary rounded-lg cursor-pointer text-sm"
                onClick={() => onMenuClick(item)}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </h2>
            ))}
            {activeTeam?.createdBy === user?.email && <RenameTeamModal />}
            <LogoutLink>
              <h2
                className="flex gap-2 items-center
                        p-2 hover:bg-secondary rounded-lg cursor-pointer text-sm"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </h2>
            </LogoutLink>
          </div>
          <Separator className="mt-2" />
          {/* User Info Section  */}
          {user && (
            <div className="mt-2 flex gap-2 items-center">
              <Avatar className="w-[40px] h-[40px]">
                <AvatarImage src={userData?.image} />
                <AvatarFallback className=" text-xs">
                  {user?.given_name?.charAt(0)}
                  {user?.family_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-[14px] font-bold">
                  {user?.given_name} {user?.family_name}
                </h2>
                <h2 className="text-[12px] text-muted-foreground">
                  {user?.email}
                </h2>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* All File Button  */}
      <Button
        variant="secondary"
        className="w-full justify-start gap-2 font-bold mt-8"
        onClick={() => router.push("/dashboard")}
      >
        <LayoutGrid className="h-5 w-5" />
        All Files
      </Button>

      {activeTeam && (
        <MembersList
          createdBy={activeTeam.createdBy!}
          TeamMembers={teamMembersData}
        />
      )}
    </div>
  );
}

export default SideNavTopSection;
