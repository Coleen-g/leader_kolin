import ArticleList from "./ArticleList";
import CommentSection from "./CommentSection";
import Sidebar from "./Sidebar";
import StudentReader from "./StudentReader";
import Toasts from "./Toasts";
export default function App() {
  return (
   <div>
    <ArticleList/>
    <CommentSection/>
    <Sidebar/>
    <StudentReader/>
    <Toasts/>
   </div>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
