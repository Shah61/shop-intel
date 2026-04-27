import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

type ChatRole = 'ai' | 'user'
interface Turn { role: ChatRole; text: string }

const SCENARIOS: Turn[][] = [
  [
    { role:'ai', text:'Pulse detected a revenue dip on Shopee for your top SKU over the last 48 hours. Would you like the likely root causes?' },
    { role:'user', text:'Yes, and tell me what the team should do first.' },
    { role:'ai', text:'Primary drivers: ad fatigue on the winning creative and a 12% stock imbalance in two warehouses. First actions: rotate fresh creatives and rebalance stock to high-demand zones today.' },
  ],
  [
    { role:'ai', text:'Your paid campaigns generated strong traffic this week, but checkout conversion dropped by 9% on mobile.' },
    { role:'user', text:'What changed, and draft a quick action brief.' },
    { role:'ai', text:'Drop is concentrated on one landing flow after a recent update. I prepared a concise brief with rollback, QA checks, and messaging updates for your growth and product leads.' },
  ],
  [
    { role:'ai', text:'I found repeat customer complaints tied to delayed fulfillment in two branches.' },
    { role:'user', text:'Summarize impact and draft a response plan.' },
    { role:'ai', text:"I created a branch-level impact report, flagged the highest-risk orders, and drafted a response plan for operations and customer support with clear owner actions." },
  ],
  [
    { role:'ai', text:'Branch A leads on conversion, while Branch B leads on traffic but underperforms on basket size.' },
    { role:'user', text:'Give me a coaching playbook each manager can use this week.' },
    { role:'ai', text:"Done. I prepared manager-ready coaching notes: Branch A focuses on traffic acquisition; Branch B applies upsell and bundle tactics proven in Branch A." },
  ],
]

/* ═══════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════ */

type DeviceType = 'macbook' | 'ipad' | 'iphone'

function useDeviceType(): DeviceType {
  const [device, setDevice] = useState<DeviceType>('macbook')

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      if (w < 580) setDevice('iphone')
      else if (w < 1024) setDevice('ipad')
      else setDevice('macbook')
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return device
}

function useTypewriter(text: string, speed: number, trigger: boolean, resetKey: number) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!trigger) { setDisplayed(''); setDone(false); return }
    setDisplayed(''); setDone(false)
    let i = 0; let interval: ReturnType<typeof setInterval> | undefined
    const d = setTimeout(() => {
      interval = setInterval(() => {
        i += 1; setDisplayed(text.slice(0, i))
        if (i >= text.length) { if (interval) clearInterval(interval); setDone(true) }
      }, speed)
    }, 0)
    return () => { clearTimeout(d); if (interval) clearInterval(interval) }
  }, [trigger, text, speed, resetKey])
  return { displayed, done }
}

/* ═══════════════════════════════════════════
   CHAT COMPONENTS
   ═══════════════════════════════════════════ */

function ChatMessage({ message, active, onDone, resetKey }: {
  message: Turn; active: boolean; onDone?: () => void; resetKey: number
}) {
  const { displayed, done } = useTypewriter(message.text, message.role === 'user' ? 18 : 22, active, resetKey)
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone }, [onDone])
  const prevDone = useRef(false)
  useEffect(() => { prevDone.current = false }, [resetKey])
  useEffect(() => {
    if (done && !prevDone.current) { prevDone.current = true; onDoneRef.current?.() }
    if (!done) prevDone.current = false
  }, [done])

  if (!active && !displayed) return null
  const isUser = message.role === 'user'

  return (
    <div style={{ display:'flex', justifyContent: isUser?'flex-end':'flex-start', marginBottom:14, opacity:displayed?1:0, transition:'opacity 0.3s' }}>
      <div style={{
        maxWidth:'82%', padding:'11px 15px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        background: isUser ? 'rgba(255,255,255,0.09)' : 'transparent',
        border: isUser ? '1px solid rgba(255,255,255,0.11)' : 'none',
        color:'rgba(255,255,255,0.9)', fontSize:13, lineHeight:1.55,
        fontFamily:"-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif",
        backdropFilter: isUser ? 'blur(16px)' : 'none',
      }}>
        {displayed}
        {!done && <span style={{ display:'inline-block', width:2, height:'1em', background:'rgba(255,255,255,0.75)', marginLeft:2, verticalAlign:'text-bottom', animation:'ai-advisor-blink 1s steps(1) infinite' }}/>}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   WATER ORB
   ═══════════════════════════════════════════ */

function WaterOrb({ onClick }: { onClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    const S = 260; c.width = S; c.height = S
    const cx = S/2, cy = S/2, r = 56
    let t = 0
    const draw = () => {
      t += 0.016; ctx.clearRect(0,0,S,S)
      let g = ctx.createRadialGradient(cx,cy,r+8,cx,cy,r+28)
      g.addColorStop(0,'rgba(180,165,220,0.07)'); g.addColorStop(1,'rgba(180,165,220,0)')
      ctx.beginPath(); ctx.arc(cx,cy,r+28,0,Math.PI*2); ctx.fillStyle=g; ctx.fill()
      g = ctx.createRadialGradient(cx-7,cy-9,5,cx,cy,r)
      g.addColorStop(0,'rgba(225,220,245,0.32)'); g.addColorStop(0.4,'rgba(195,185,235,0.18)')
      g.addColorStop(0.7,'rgba(165,155,225,0.1)'); g.addColorStop(1,'rgba(145,135,215,0.04)')
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill()
      ctx.strokeStyle='rgba(210,200,245,0.16)'; ctx.lineWidth=1.5; ctx.stroke()
      for (let i=0;i<6;i++){
        const a=t*(0.5+i*0.13)+i*1.047, d=9+Math.sin(t*0.7+i*1.8)*6
        const bx=cx+Math.cos(a)*d, by=cy+Math.sin(a)*d, br=4.5+Math.sin(t*1.1+i*1.3)*2.2
        g=ctx.createRadialGradient(bx,by,0,bx,by,br)
        g.addColorStop(0,`rgba(205,195,245,${0.2+Math.sin(t+i)*0.06})`); g.addColorStop(1,'rgba(205,195,245,0)')
        ctx.beginPath(); ctx.arc(bx,by,br,0,Math.PI*2); ctx.fillStyle=g; ctx.fill()
      }
      ctx.beginPath()
      for (let i=0;i<=64;i++){
        const a=(i/64)*Math.PI*2
        const w=Math.sin(a*3+t*2.4)*3+Math.sin(a*5-t*1.7)*1.8+Math.sin(a*2+t*3)*1.3
        const px=cx+Math.cos(a)*(16+w), py=cy+Math.sin(a)*(16+w)
        if(i===0)ctx.moveTo(px,py); else ctx.lineTo(px,py)
      }
      ctx.closePath()
      g=ctx.createRadialGradient(cx-4,cy-4,2,cx,cy,20)
      g.addColorStop(0,'rgba(215,205,250,0.16)'); g.addColorStop(0.5,'rgba(185,175,240,0.07)'); g.addColorStop(1,'rgba(165,155,230,0.01)')
      ctx.fillStyle=g; ctx.fill()
      ctx.beginPath(); ctx.ellipse(cx,cy-11,15,7.5,0,Math.PI+0.3,-0.3)
      g=ctx.createLinearGradient(cx-12,cy-22,cx+12,cy-5)
      g.addColorStop(0,'rgba(255,255,255,0.2)'); g.addColorStop(1,'rgba(255,255,255,0)')
      ctx.fillStyle=g; ctx.fill()
      ctx.save(); ctx.translate(cx,cy)
      ctx.globalAlpha=0.45+Math.sin(t*0.7)*0.1
      ctx.strokeStyle='rgba(215,205,250,0.55)'; ctx.lineWidth=1.6; ctx.lineCap='round'
      for(let j=0;j<3;j++){
        ctx.beginPath(); const yo=(j-1)*6.5
        for(let x=-9;x<=9;x++){ const wy=yo+Math.sin((x+t*38)*0.14+j)*2.8; if(x===-9)ctx.moveTo(x,wy); else ctx.lineTo(x,wy) }
        ctx.stroke()
      }
      ctx.restore()
      animRef.current=requestAnimationFrame(draw)
    }
    draw()
    return () => { if(animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  return (
    <button type="button" onClick={onClick} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ width:110,height:110,borderRadius:'50%',border:'none',background:'transparent',cursor:'pointer',
        padding:0,outline:'none',display:'flex',alignItems:'center',justifyContent:'center',
        transition:'transform 0.3s cubic-bezier(0.4,0,0.2,1)', transform:hovered?'scale(1.12)':'scale(1)' }}>
      <canvas ref={canvasRef} style={{ width:110,height:110,pointerEvents:'none' }}/>
    </button>
  )
}

/* ═══════════════════════════════════════════
   DEVICE FRAMES
   ═══════════════════════════════════════════ */

/* ─── MacBook Pro ─── */
function MacBookPro({ children }: { children: ReactNode }) {
  return (
    <div style={{ width:740, maxWidth:'92vw', margin:'0 auto', position:'relative' }}>
      <div style={{
        position:'relative',
        background:'linear-gradient(175deg, #333336 0%, #28282a 30%, #1f1f21 70%, #1a1a1c 100%)',
        borderRadius:'14px 14px 0 0', padding:'8px 8px 0 8px',
        boxShadow:'inset 0 0 0 0.5px rgba(255,255,255,0.08), 0 -2px 10px rgba(0,0,0,0.2)',
      }}>
        <div style={{ position:'absolute',top:0,left:12,right:12,height:1, background:'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 20%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.07) 80%, transparent 100%)', borderRadius:'14px 14px 0 0' }}/>
        {/* Camera bar */}
        <div style={{ height:24, background:'linear-gradient(180deg, #1a1a1c 0%, #141416 100%)', borderRadius:'8px 8px 0 0', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          <div style={{ position:'relative', width:8, height:8 }}>
            <div style={{ width:8,height:8,borderRadius:'50%', background:'radial-gradient(circle at 45% 40%, #2a2a2c 0%, #111113 100%)', border:'0.5px solid #444', boxShadow:'0 0 0 1px #0c0c0e, 0 0 4px rgba(0,0,0,0.6)' }}/>
            <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)', width:3.5,height:3.5,borderRadius:'50%', background:'radial-gradient(circle at 40% 35%, #283828 0%, #1a2a1a 60%, #0f1a0f 100%)', boxShadow:'inset 0 0.5px 1px rgba(255,255,255,0.08)' }}/>
          </div>
        </div>
        {/* Screen */}
        <div style={{ width:'100%', aspectRatio:'16/10', borderRadius:1, overflow:'hidden', position:'relative', background:'#000', boxShadow:'inset 0 0 0 0.5px rgba(0,0,0,0.9), inset 0 0 6px rgba(0,0,0,0.5)' }}>
          <div style={{ position:'absolute',inset:0,zIndex:5,pointerEvents:'none', background:'linear-gradient(135deg, rgba(255,255,255,0.012) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.006) 100%)' }}/>
          {children}
        </div>
        <div style={{ height:3, background:'linear-gradient(180deg, #141416 0%, #1a1a1c 100%)' }}/>
      </div>
      {/* Hinge */}
      <div style={{ height:8, background:'linear-gradient(180deg, #48484a 0%, #3a3a3c 25%, #48484a 50%, #3a3a3c 75%, #2c2c2e 100%)', position:'relative', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.2)' }}>
        <div style={{ position:'absolute',top:0,left:'5%',right:'5%',height:1, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.13) 50%, rgba(255,255,255,0.1) 70%, transparent)' }}/>
        <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'30%',height:1, background:'linear-gradient(90deg, transparent, rgba(0,0,0,0.35) 20%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.35) 80%, transparent)', borderRadius:0.5 }}/>
      </div>
      {/* Base */}
      <div style={{ height:10, marginLeft:-18, marginRight:-18, background:'linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 30%, #232325 70%, #1c1c1e 100%)', borderRadius:'0 0 10px 10px', position:'relative', boxShadow:'0 2px 6px rgba(0,0,0,0.25), 0 8px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
        <div style={{ position:'absolute',top:0,left:'8%',right:'8%',height:1, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.035) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.035) 75%, transparent)' }}/>
        <div style={{ position:'absolute',top:-1,left:'50%',transform:'translateX(-50%)',width:48,height:3.5, background:'linear-gradient(180deg, #2a2a2c 0%, #222224 100%)', borderRadius:'0 0 5px 5px', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.35)' }}/>
      </div>
      <div style={{ height:12,marginLeft:30,marginRight:30,marginTop:-3, background:'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.22) 0%, transparent 75%)', filter:'blur(5px)' }}/>
    </div>
  )
}

/* ─── iPad Pro ─── */
function IPadPro({ children }: { children: ReactNode }) {
  return (
    <div style={{ width:520, maxWidth:'88vw', margin:'0 auto', position:'relative' }}>
      <div style={{
        position:'relative',
        background:'linear-gradient(175deg, #2c2c2e 0%, #1c1c1e 50%, #161618 100%)',
        borderRadius:18, padding:14,
        boxShadow:'inset 0 0 0 0.5px rgba(255,255,255,0.06), 0 4px 30px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)',
      }}>
        {/* Top edge highlight */}
        <div style={{ position:'absolute',top:0,left:20,right:20,height:1, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.06) 70%, transparent)', borderRadius:18 }}/>
        {/* Camera */}
        <div style={{ position:'absolute',top:7,left:'50%',transform:'translateX(-50%)', width:6,height:6,borderRadius:'50%', background:'radial-gradient(circle at 45% 40%, #1e1e20 0%, #0c0c0e 100%)', border:'0.5px solid #333', boxShadow:'0 0 0 1px rgba(0,0,0,0.4)' }}>
          <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)', width:2.5,height:2.5,borderRadius:'50%', background:'radial-gradient(circle, #1a2a1a 0%, #0f1a0f 100%)' }}/>
        </div>
        {/* Screen */}
        <div style={{ width:'100%', aspectRatio:'4/3', borderRadius:6, overflow:'hidden', position:'relative', background:'#000', boxShadow:'inset 0 0 0 0.5px rgba(0,0,0,0.8), inset 0 0 4px rgba(0,0,0,0.4)' }}>
          <div style={{ position:'absolute',inset:0,zIndex:5,pointerEvents:'none', background:'linear-gradient(145deg, rgba(255,255,255,0.015) 0%, transparent 45%, transparent 55%, rgba(255,255,255,0.008) 100%)' }}/>
          {children}
        </div>
        {/* Side buttons (volume) */}
        <div style={{ position:'absolute',top:60,right:-2,width:2,height:28, background:'linear-gradient(180deg, #3a3a3c, #2c2c2e)', borderRadius:'0 2px 2px 0' }}/>
        <div style={{ position:'absolute',top:100,right:-2,width:2,height:28, background:'linear-gradient(180deg, #3a3a3c, #2c2c2e)', borderRadius:'0 2px 2px 0' }}/>
        {/* Power button */}
        <div style={{ position:'absolute',top:60,left:-2,width:2,height:36, background:'linear-gradient(180deg, #3a3a3c, #2c2c2e)', borderRadius:'2px 0 0 2px' }}/>
      </div>
      {/* Shadow */}
      <div style={{ height:16,marginLeft:24,marginRight:24,marginTop:-4, background:'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.2) 0%, transparent 70%)', filter:'blur(6px)' }}/>
    </div>
  )
}

/* ─── iPhone Pro ─── */
function IPhonePro({ children }: { children: ReactNode }) {
  return (
    <div style={{ width:280, maxWidth:'80vw', margin:'0 auto', position:'relative' }}>
      <div style={{
        position:'relative',
        background:'linear-gradient(175deg, #2a2a2c 0%, #1a1a1c 50%, #141416 100%)',
        borderRadius:40, padding:'12px 10px',
        boxShadow:'inset 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 0 0 2px #1a1a1c, 0 4px 30px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3)',
      }}>
        {/* Titanium edge highlights */}
        <div style={{ position:'absolute',top:0,left:30,right:30,height:1, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 30%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.07) 70%, transparent)', borderRadius:40 }}/>
        <div style={{ position:'absolute',bottom:0,left:30,right:30,height:1, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.04) 70%, transparent)', borderRadius:40 }}/>
        {/* Left side highlight */}
        <div style={{ position:'absolute',left:0,top:60,bottom:60,width:1, background:'linear-gradient(180deg, transparent, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.04) 70%, transparent)' }}/>

        {/* Screen */}
        <div style={{ width:'100%', aspectRatio:'9/19.5', borderRadius:30, overflow:'hidden', position:'relative', background:'#000', boxShadow:'inset 0 0 0 0.5px rgba(0,0,0,0.8)' }}>
          {/* Dynamic Island */}
          <div style={{ position:'absolute',top:10,left:'50%',transform:'translateX(-50%)', width:96,height:28,borderRadius:20, background:'#000', zIndex:10 }}>
            <div style={{ position:'absolute',top:'50%',left:22,transform:'translateY(-50%)', width:8,height:8,borderRadius:'50%', background:'radial-gradient(circle at 40% 35%, #1a1a2a 0%, #0a0a12 100%)', boxShadow:'inset 0 0.5px 1px rgba(255,255,255,0.05)' }}/>
          </div>
          {/* Glass reflection */}
          <div style={{ position:'absolute',inset:0,zIndex:5,pointerEvents:'none', background:'linear-gradient(155deg, rgba(255,255,255,0.02) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.008) 100%)' }}/>
          {children}
        </div>

        {/* Side buttons */}
        <div style={{ position:'absolute',top:100,right:-2,width:2.5,height:56, background:'linear-gradient(180deg, #3a3a3c, #2c2c2e)', borderRadius:'0 2px 2px 0' }}/>
        <div style={{ position:'absolute',top:80,left:-2,width:2.5,height:30, background:'linear-gradient(180deg, #3a3a3c, #2c2c2e)', borderRadius:'2px 0 0 2px' }}/>
        <div style={{ position:'absolute',top:125,left:-2,width:2.5,height:44, background:'linear-gradient(180deg, #3a3a3c, #2c2c2e)', borderRadius:'2px 0 0 2px' }}/>
        <div style={{ position:'absolute',top:175,left:-2,width:2.5,height:44, background:'linear-gradient(180deg, #3a3a3c, #2c2c2e)', borderRadius:'2px 0 0 2px' }}/>
      </div>
      {/* Shadow */}
      <div style={{ height:14,marginLeft:20,marginRight:20,marginTop:-4, background:'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.25) 0%, transparent 70%)', filter:'blur(5px)' }}/>
    </div>
  )
}

/* ═══════════════════════════════════════════
   DEVICE SWITCHER
   ═══════════════════════════════════════════ */

function DeviceFrame({ device, children }: { device: DeviceType; children: ReactNode }) {
  if (device === 'iphone') return <IPhonePro>{children}</IPhonePro>
  if (device === 'ipad') return <IPadPro>{children}</IPadPro>
  return <MacBookPro>{children}</MacBookPro>
}

/* ═══════════════════════════════════════════
   SCREEN CONTENT
   ═══════════════════════════════════════════ */

function ScreenContent({ isVisible, scenarioIndex, onRegenerate }: {
  isVisible: boolean; scenarioIndex: number; onRegenerate: () => void
}) {
  const [phase, setPhase] = useState(-1)
  const msgs = SCENARIOS[scenarioIndex]

  useEffect(() => {
    if (isVisible) { setPhase(-1); const t = setTimeout(()=>setPhase(0),600); return ()=>clearTimeout(t) }
    setPhase(-1); return undefined
  }, [isVisible, scenarioIndex])

  const handleDone = useCallback((i: number) => { setTimeout(()=>setPhase(i+1), 450) }, [])

  return (
    <div style={{
      width:'100%', height:'100%',
      background:'linear-gradient(120deg, #b15c8a 0%, #6b3f6e 35%, #1c1b2f 65%, #4a6f91 100%)',
      display:'flex', flexDirection:'column', position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute',bottom:'-20%',right:'-10%',width:'70%',height:'70%', background:'radial-gradient(circle,rgba(177,92,138,0.22) 0%,transparent 70%)', filter:'blur(40px)',pointerEvents:'none' }}/>
      <div style={{ position:'absolute',top:'8%',left:'3%',width:'45%',height:'45%', background:'radial-gradient(circle,rgba(107,63,110,0.22) 0%,transparent 70%)', filter:'blur(50px)',pointerEvents:'none' }}/>
      <div style={{ position:'absolute',bottom:'5%',left:'50%',transform:'translateX(-50%)',width:'40%',height:'30%', background:'radial-gradient(circle,rgba(180,200,240,0.08) 0%,transparent 70%)', filter:'blur(25px)',pointerEvents:'none' }}/>

      {/* Window chrome */}
      <div style={{ padding:'9px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.4)', fontFamily:'-apple-system,sans-serif', flexShrink:0 }}>
        <div style={{ display:'flex', gap:6 }}>
          {([['#ff5f57','#e0443e'],['#febc2e','#dea123'],['#28c840','#1fa934']] as const).map(([bg,sh],i)=>(
            <div key={i} style={{ width:10,height:10,borderRadius:'50%',background:bg, boxShadow:`inset 0 -0.5px 0.5px ${sh}, 0 0.5px 1px rgba(0,0,0,0.12)` }}/>
          ))}
        </div>
        <span style={{ opacity:0.5, letterSpacing:'0.06em', fontSize:11 }}>AI Advisor</span>
        <div style={{ width:45 }}/>
      </div>

      {/* Chat */}
      <div style={{ flex:1, padding:'14px 24px', display:'flex', flexDirection:'column', justifyContent:'center', position:'relative', zIndex:2, overflow:'hidden' }}>
        {msgs.map((msg,i) => (
          <ChatMessage key={`${scenarioIndex}-${i}`} message={msg} active={phase>=i} onDone={()=>handleDone(i)} resetKey={scenarioIndex}/>
        ))}
      </div>

      {/* Water orb */}
      <div style={{ padding:'4px 0 16px', display:'flex', justifyContent:'center', flexShrink:0, position:'relative', zIndex:3 }}>
        <WaterOrb onClick={onRegenerate}/>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   STREAMING TEXT
   ═══════════════════════════════════════════ */

function StreamingText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [displayed, setDisplayed] = useState('')
  const triggered = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    triggered.current = false; setDisplayed('')
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !triggered.current) {
        triggered.current = true; let i = 0
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => {
          i += 1; setDisplayed(text.slice(0, i))
          if (i >= text.length && intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
        }, 25)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => { obs.disconnect(); if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null } }
  }, [text])

  return (
    <p ref={ref} style={{ fontSize:13.5, lineHeight:1.6, color:'rgba(255,255,255,0.35)', margin:0, fontWeight:400, minHeight:'3.2em' }}>
      {displayed}
      {displayed.length > 0 && displayed.length < text.length && (
        <span style={{ display:'inline-block', width:2, height:'1em', background:'rgba(255,255,255,0.4)', marginLeft:2, verticalAlign:'text-bottom', animation:'ai-advisor-blink 1s steps(1) infinite' }}/>
      )}
    </p>
  )
}

/* ═══════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════ */

export default function AIAdvisorTour() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [idx, setIdx] = useState(0)
  const device = useDeviceType()

  /* ── Only trigger when the section scrolls into view ── */
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setIsVisible(true)
      else setIsVisible(false)
    }, { threshold: 0.35 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  const regen = () => {
    setIsVisible(false)
    setTimeout(() => { setIdx(p=>(p+1)%SCENARIOS.length); setIsVisible(true) }, 200)
  }

  return (
    <section ref={ref} style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg, #08060c 0%, #08060c 30%, #150e20 50%, #2d1a3a 70%, #4a2d5a 85%, #6b3f6e 95%, #8a5590 100%)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'70px 20px 80px', position:'relative', overflow:'hidden',
      fontFamily:"'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    }}>
      <style>{`
        @keyframes ai-advisor-blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
        @keyframes ai-advisor-heroIn { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes ai-advisor-macIn {
  from { opacity:0; transform:translateY(74px) scale(0.97) }
  to { opacity:1; transform:translateY(95px) scale(1) }
}        @keyframes ai-advisor-deviceSwitch { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        @keyframes ai-advisor-deviceIn {
  from { opacity:0; transform:translateY(40px) scale(0.97) }
  to { opacity:1; transform:translateY(0) scale(1) }
}
      `}</style>

      {/* BG glows */}
      <div style={{ position:'absolute',top:'12%',right:'-6%',width:'50%',height:'60%', background:'radial-gradient(ellipse,rgba(140,80,150,0.1) 0%,transparent 70%)', filter:'blur(80px)',pointerEvents:'none' }}/>
      <div style={{ position:'absolute',bottom:'8%',left:'8%',width:'35%',height:'35%', background:'radial-gradient(ellipse,rgba(107,63,110,0.08) 0%,transparent 70%)', filter:'blur(60px)',pointerEvents:'none' }}/>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:55, animation:'ai-advisor-heroIn 0.8s ease-out forwards', position:'relative', zIndex:2 }}>
        <div style={{ fontSize:11, fontWeight:500, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.38)', marginBottom:16 }}>Product Tour</div>
        <h2 style={{ fontSize:'clamp(34px,5vw,60px)', fontWeight:300, color:'rgba(255,255,255,0.92)', margin:0, letterSpacing:'-0.03em', lineHeight:1.1 }}>Your AI Advisor</h2>
      </div>

      {/* Device */}
      <div key={device} style={{
  animation: device === 'macbook' 
    ? 'ai-advisor-macIn 1s ease-out 0.3s both' 
    : 'ai-advisor-deviceIn 1s ease-out 0.3s both',
  width:'100%', 
  maxWidth: device === 'macbook' ? 780 : device === 'ipad' ? 560 : 320,
  position:'relative', zIndex:2,
}}>
        <DeviceFrame device={device}>
          <ScreenContent isVisible={isVisible} scenarioIndex={idx} onRegenerate={regen}/>
        </DeviceFrame>
      </div>

      {/* Subtitle */}
      <div style={{ position:'absolute', bottom:40, left: device === 'iphone' ? 20 : 40, maxWidth:340, zIndex:2 }}>
        <StreamingText text="A conversational AI advisor built for operators running modern commerce brands with PULSE." />
      </div>
    </section>
  )
}