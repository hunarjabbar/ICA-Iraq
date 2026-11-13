// One canonical private CCC staff identity. This is an external handoff, not an ICA login.
export const CCC_CENTRAL_ORIGIN='https://ccc-command-centre.vercel.app'
export const ICA_STAFF_WORKSPACES={
 editorial:'ica-editorial',
 executive:'ica'
} as const
export function icaStaffHandoff(kind:keyof typeof ICA_STAFF_WORKSPACES='editorial'):string{
 return CCC_CENTRAL_ORIGIN+'/signin?workspace='+encodeURIComponent(ICA_STAFF_WORKSPACES[kind])
}
