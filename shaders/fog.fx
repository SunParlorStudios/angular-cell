cbuffer Global : register(b0)
{
	float Time;
	float4x4 View;
	float4x4 Projection;
	float4 EyePosition;
}

cbuffer PerObject : register(b1)
{
	float4x4 World;
	float4x4 InvWorld;
	float4 AnimationCoords;
	float3 Blend;
	float Alpha;
}

cbuffer Uniforms : register(b2)
{
	float4 Depth;
}

struct VOut
{
	float4 position : SV_POSITION;
	float4 colour : COLOUR;
	float2 texcoord : TEXCOORD0;
	float3 normal : TEXCOORD2;
	float3 tangent : TEXCOORD3;
	float3 bitangent : TEXCOORD4;
};

VOut VS(float4 position : POSITION, float4 colour : COLOUR, float2 texcoord : TEXCOORD0, float3 normal : NORMAL, float3 tangent : TANGENT, float3 bitangent : BITANGENT)
{
	VOut output;
	output.position = mul(position, World);
	output.position = mul(output.position, View);
	output.position = mul(output.position, Projection);
	output.normal = mul(normal, (float3x3)InvWorld);
	output.texcoord = texcoord;
	output.colour = colour;
	output.normal = normalize(mul(normal, (float3x3)InvWorld));
	output.tangent = normalize(mul(tangent, (float3x3)InvWorld));
	output.bitangent = normalize(mul(bitangent, (float3x3)InvWorld));
	return output;
}

Texture2D TexDiffuse : register(t1);
SamplerState Sampler;

struct PSOut
{
	float4 diffuse : SV_Target0;
	float4 distort : SV_Target1;
};

PSOut PS(VOut input)
{
	PSOut output;
	float x = (input.texcoord.x * AnimationCoords.z) + AnimationCoords.x;
	float y = (input.texcoord.y * AnimationCoords.w) + AnimationCoords.y;
	float2 coords = float2(x, y);
	output.diffuse = TexDiffuse.Sample(Sampler, coords);
	float4 rim = TexDiffuse.Sample(Sampler, coords + float2(-0.0005f, 0.0005f));
	rim.a *= Alpha;

	output.diffuse.rgb *= input.colour.rgb * Blend;
	output.diffuse.a *= Alpha;

	output.distort = 0;

	if (output.diffuse.r > 0.6 && output.diffuse.g < 0.1 && output.diffuse.b > 0.6)
	{
		output.distort = float4(1, 1, 1, output.diffuse.a);
		output.diffuse = 0;
	}
	else if (Depth.r >= 0)
	{
		output.diffuse.rgb = lerp(output.diffuse.rgb, float3(0.0f, 0.65f, 0.8f), Depth.r * 0.5f);
		output.diffuse.rgb = lerp(output.diffuse.rgb, float3(0.1f, 0.5f, 0.8f), (1 - input.position.y / 720.0f) * 0.5f);
	}

	if (output.diffuse.a < rim.a - 0.02)
	{
		output.diffuse = float4(0.4, 1, 1, smoothstep(1, 0, rim.a / 2));
	}

	
	return output;
}