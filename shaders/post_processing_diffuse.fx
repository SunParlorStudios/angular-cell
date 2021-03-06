cbuffer Global : register(b0)
{
	float Time;
	float4x4 View;
	float4x4 Projection;
	float4 EyePosition;
	float4x4 InvViewProjection;
}

cbuffer Uniforms : register(b2)
{
	float4 Distortion;
	float4 Flicker;
}

struct VOut
{
	float4 position : SV_POSITION;
	float4 colour : COLOUR;
	float2 texcoord : TEXCOORD0;
	float3 normal : NORMAL;
};

VOut VS(float4 position : POSITION, float4 colour : COLOUR, float2 texcoord : TEXCOORD0, float3 normal : NORMAL)
{
	VOut output;
	output.position = position;
	output.normal = normal;
	output.texcoord = texcoord;
	output.colour = colour;
	return output;
}

Texture2D Target : register(t0);
Texture2D Distort : register(t1);
SamplerState Sampler;

float4 PS(VOut input) : SV_TARGET
{
	float2 coords = input.texcoord;
	float2 cc = coords - 0.5;
    float dist = dot(cc, cc) * Distortion.x;
    coords = (coords + cc * (1.0 + dist) * dist);

    clip(coords - 0.001);
    clip((1.0f - coords) - 0.001);

    float d = Distort.Sample(Sampler, coords).r;

    if (d > 0)
    {
        coords.y += 0.06;
        coords.y /= 1.2;
    }

    float4 avg = float4(0.0f, 0.0f, 0.0f, 0.0f);
    float filterSize = 4.0f;
    float count = 0.0f;

    float4 col = Target.Sample(Sampler, coords);

    for (float x = -filterSize; x < filterSize; ++x)
    {
    	for (float y = -filterSize; y < filterSize; ++y)
    	{
    		avg += Target.Sample(Sampler, coords + float2(x / 1280.0f, y / 720.0f));
    		count += 1.0f;
    	}
    }

    avg /= count;

    float half_y = input.texcoord.y * 720.0f * 0.4;
    float delta = round(half_y) - half_y;
    float delta_squared = delta * delta;

    col.rgb += avg.rgb * 0.75;
    col.rgb = saturate(col.rgb);
    col.rgb /= 1.5;

    float gray = (col.r + col.g + col.b) / 3.0f;

    col.rgb = lerp(col.rgb, gray, Flicker.x);

    if (delta_squared < 0.1) 
    {
       return col * 0.9;
    } 

    return col;
}