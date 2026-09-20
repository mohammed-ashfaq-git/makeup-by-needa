export function DbError() {
  return (
    <div className="a-banner error" role="alert">
      <span aria-hidden="true">!</span>
      <span>
        The database is not reachable right now, so this page cannot load
        saved content. Check the DATABASE_URL setting or try again in a
        moment. (The public website is unaffected and keeps serving its
        fallback content.)
      </span>
    </div>
  );
}
