/* ================= MUI icons ================= */
import HomeRounded from "@mui/icons-material/HomeRounded";
import StyleRounded from "@mui/icons-material/StyleRounded";
import ArticleRounded from "@mui/icons-material/ArticleRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import DescriptionRounded from "@mui/icons-material/DescriptionRounded";
import BarChartRounded from "@mui/icons-material/BarChartRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import MenuRounded from "@mui/icons-material/MenuRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import PrintRounded from "@mui/icons-material/PrintRounded";
import PsychologyRounded from "@mui/icons-material/PsychologyRounded";
import LocalFireDepartmentRounded from "@mui/icons-material/LocalFireDepartmentRounded";
import BoltRounded from "@mui/icons-material/BoltRounded";
import DeleteRounded from "@mui/icons-material/DeleteRounded";
import MicRounded from "@mui/icons-material/MicRounded";
import CodeRounded from "@mui/icons-material/CodeRounded";
import AddRounded from "@mui/icons-material/AddRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import GridViewRounded from "@mui/icons-material/GridViewRounded";
import FavoriteRounded from "@mui/icons-material/FavoriteRounded";
import StarRounded from "@mui/icons-material/StarRounded";
import StarBorderRounded from "@mui/icons-material/StarBorderRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import CelebrationRounded from "@mui/icons-material/CelebrationRounded";
import LoopRounded from "@mui/icons-material/LoopRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import ExploreRounded from "@mui/icons-material/ExploreRounded";
import LibraryBooksRounded from "@mui/icons-material/LibraryBooksRounded";
import EditNoteRounded from "@mui/icons-material/EditNoteRounded";
import SpaRounded from "@mui/icons-material/SpaRounded";
import StadiumRounded from "@mui/icons-material/StadiumRounded";
import RecordVoiceOverRounded from "@mui/icons-material/RecordVoiceOverRounded";
import AccountBalanceRounded from "@mui/icons-material/AccountBalanceRounded";
import EventAvailableRounded from "@mui/icons-material/EventAvailableRounded";
import DiamondRounded from "@mui/icons-material/DiamondRounded";
import ShieldRounded from "@mui/icons-material/ShieldRounded";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import EmojiEventsRounded from "@mui/icons-material/EmojiEventsRounded";

const ICONS = {
  home:HomeRounded, review:StyleRounded, sheet:ArticleRounded, spark:AutoAwesomeRounded, notes:DescriptionRounded,
  chart:BarChartRounded, gear:SettingsRounded, menu:MenuRounded, search:SearchRounded, out:LogoutRounded,
  print:PrintRounded, brain:PsychologyRounded, fire:LocalFireDepartmentRounded, bolt:BoltRounded, trash:DeleteRounded,
  mic:MicRounded, code:CodeRounded, plus:AddRounded, edit:EditRounded, grid:GridViewRounded,
  heart:FavoriteRounded, star:StarRounded, starOff:StarBorderRounded, warn:WarningAmberRounded, check:CheckRounded,
  party:CelebrationRounded, loop:LoopRounded, arrow:ArrowForwardRounded,
  /* badges */
  first:MenuBookRounded, tour:ExploreRounded, book:LibraryBooksRounded, author:EditNoteRounded, skill:SpaRounded,
  arena:StadiumRounded, interview:RecordVoiceOverRounded, shark:StyleRounded, palace:AccountBalanceRounded,
  week:EventAvailableRounded, flawless:DiamondRounded, boss:ShieldRounded, long:CalendarMonthRounded, master:EmojiEventsRounded
};

/* a sized icon slot, matching the .ic styles used across the app */
export function Icon({name}){
  const C = ICONS[name];
  return <span className="ic"><C fontSize="inherit" aria-hidden="true" /></span>;
}
/* a bare icon that inherits the surrounding font size and color */
export function Glyph({name, className}){
  const C = ICONS[name];
  return <C fontSize="inherit" className={className} aria-hidden="true" />;
}
