export default function BadgeCard({ badge }) {
  if (!badge) return null;
  return (
    <div style={{
      background:"rgba(255,255,255,.05)",
      border:"1px solid rgba(255,255,255,.08)",
      borderRadius:12,
      padding:".9rem",
      textAlign:"center",
      color:"#fff"
    }}>
      {badge.icon_url && (
        <img src={badge.icon_url} alt={badge.name}
          style={{width:40,height:40,margin:"0 auto .5rem",display:"block"}} />
      )}
      <p style={{fontWeight:700,fontSize:".82rem"}}>{badge.name}</p>
      <p style={{fontSize:".7rem",opacity:.4,marginTop:".2rem"}}>{badge.description}</p>
    </div>
  );
}